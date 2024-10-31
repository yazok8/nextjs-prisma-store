// src/app/webhooks/stripe/product/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { renderPurchaseReceiptEmail } from '@/lib/server/renderEmail';
import { prisma } from '@/lib/prisma';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
});

// Initialize Resend for sending emails
const resend = new Resend(process.env.RESEND_API_KEY as string);

// Handler for POST requests to /webhooks/stripe/product
export async function POST(req: NextRequest) {
  console.log('Received Stripe webhook event.');

  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Missing Stripe signature or webhook secret');
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    console.log(`Constructed event: ${event.type} [${event.id}]`);
  } catch (err: any) {
    console.error('Error constructing Stripe event:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    const existingEvent = await prisma.processedEvent.findUnique({
      where: { id: event.id },
    });

    if (existingEvent) {
      console.log(`Event ${event.id} already processed.`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log(`Processing event type: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        console.log('Handled payment_intent.succeeded');
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
        // Optionally, skip marking unhandled events as processed
        return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log(`Marking event ${event.id} as processed.`);
    await prisma.processedEvent.create({
      data: {
        id: event.id,
        processedAt: new Date(),
      },
    });
    console.log(`Event ${event.id} marked as processed.`);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing Stripe event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Function to handle 'payment_intent.succeeded' events
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { userId, productId, discountCodeId, checkoutType } = paymentIntent.metadata;

    if (!userId || !checkoutType) {
      throw new Error('Missing required metadata fields in payment intent');
    }

    console.log(`Fetching user with ID: ${userId}`);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    if (checkoutType === 'single') {
      if (!productId) {
        throw new Error('Missing productId in payment intent metadata');
      }

      console.log(`Fetching product with ID: ${productId}`);
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error('Product not found.');
      }

      console.log('Creating order...');
      const order = await prisma.order.create({
        data: {
          userId,
          paymentIntentId: paymentIntent.id, // Set the paymentIntentId here
          pricePaidInCents: paymentIntent.amount,
          discountCodeId: discountCodeId || undefined,
          orderProducts: {
            create: {
              productId: product.id,
              quantity: 1,
              price: paymentIntent.amount,
            },
          },
        },
        select: {
          id: true,
          pricePaidInCents: true,
          createdAt: true,
          discountCodeId: true,
          orderProducts: {
            select: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imagePath: true,
                  description: true,
                },
              },
            },
          },
        },
      });
      console.log(`Order ${order.id} created successfully.`);

      if (discountCodeId) {
        console.log(`Updating discount code usage for ID: ${discountCodeId}`);
        const updatedDiscount = await prisma.discountCode.update({
          where: { id: discountCodeId },
          data: { uses: { increment: 1 } },
        });

        if (!updatedDiscount) {
          throw new Error('Failed to update discount code usage.');
        }
        console.log(`Discount code ${discountCodeId} usage incremented.`);
      }

      // Email sending
      const purchasedProduct = order.orderProducts[0].product;

      const emailHtml = await renderPurchaseReceiptEmail({
        order: {
          id: order.id,
          pricePaidInCents: order.pricePaidInCents,
          createdAt: order.createdAt,
        },
        product: {
          id: purchasedProduct.id,
          name: purchasedProduct.name,
        },
        downloadVerificationId: order.id,
      });

      if (!process.env.SENDER_EMAIL) {
        throw new Error('SENDER_EMAIL is not defined in environment variables.');
      }

      await resend.emails.send({
        from: `Support <${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject: 'Order Confirmation',
        html: emailHtml,
      });

      console.log('Completed handlePaymentIntentSucceeded without errors.');
    }

    // Handle other checkout types (e.g., cart) as needed
  } catch (error: any) {
    console.error('Error in handlePaymentIntentSucceeded:', error);
    throw error; // Propagate the error to be caught by the outer try/catch
  }
}
