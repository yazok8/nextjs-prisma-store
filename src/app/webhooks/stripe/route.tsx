// /src/app/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import db from '@/db/db'; // Adjust the import path based on your project structure
import { Resend } from 'resend';
import PurchaseReceiptEmail from '@/email/PurchaseReceipt';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10', // Ensure this matches your Stripe API version
});

// Initialize Resend for sending emails
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('Missing Stripe signature or webhook secret');
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Read the raw body as text
    const rawBody = await req.text();

    // Verify the event with Stripe
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error('Error constructing Stripe event:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    // Check if the event has already been processed to ensure idempotency
    const existingEvent = await db.processedEvent.findUnique({
      where: { id: event.id },
    });

    if (existingEvent) {
      console.log(`Event ${event.id} already processed.`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Handle specific event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      // Add cases for other event types if needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Mark the event as processed
    await db.processedEvent.create({
      data: {
        id: event.id,
        processedAt: new Date(),
      },
    });

    // Respond to Stripe
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing Stripe event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Function to handle 'payment_intent.succeeded' events
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { userId, productId, discountCodeId, checkoutType } = paymentIntent.metadata;

  if (!userId) {
    console.error('Missing userId in payment intent metadata');
    return;
  }

  // Fetch the user from the database
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) {
    console.error(`User with ID ${userId} not found.`);
    return;
  }

  if (checkoutType === 'single') {
    if (!productId) {
      console.error('Missing productId in payment intent metadata');
      return;
    }

    // Fetch the product from the database
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      console.error('Product not found.');
      return;
    }

    // Create the order
    const order = await db.order.create({
      data: {
        userId,
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

    // Create download verification
    const downloadVerification = await db.downloadVerification.create({
      data: {
        productId: product.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24-hour expiration
      },
    });

    // Increment discount code usage
    if (discountCodeId) {
      await db.discountCode.update({
        where: { id: discountCodeId },
        data: { uses: { increment: 1 } },
      });
    }

    const purchasedProduct = order.orderProducts[0].product;

    // Render the PurchaseReceiptEmail component to HTML
    const emailHtml = ReactDOMServer.renderToStaticMarkup(
      <PurchaseReceiptEmail
        order={order}
        product={purchasedProduct}
        downloadVerificationId={downloadVerification.id}
      />
    );

    // Send receipt email
    await resend.emails.send({
      from: `Support <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: 'Order Confirmation',
      html: emailHtml, // Use the rendered HTML string
    });
  }

  // Handle other checkout types (e.g., cart) as needed
}
