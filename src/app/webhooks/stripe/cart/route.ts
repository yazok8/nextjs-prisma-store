// src/app/webhooks/stripe/cart/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import db from '@/db/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    console.error('Missing Stripe signature');
    return new NextResponse('Missing Stripe signature', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'charge.succeeded':
      const charge = event.data.object as Stripe.Charge;

      if (typeof charge.payment_intent === 'string') {
        try {
          await db.order.update({
            where: { paymentIntentId: charge.payment_intent },
            data: {
              status: 'complete',
              Address: {
                create: {
                  city: charge.shipping?.address?.city,
                  country: charge.shipping?.address?.country,
                  line1: charge.shipping?.address?.line1,
                  line2: charge.shipping?.address?.line2,
                  postal_code: charge.shipping?.address?.postal_code,
                  state: charge.shipping?.address?.state,
                },
              },
            },
          });
        } catch (dbError) {
          console.error('Database update failed:', dbError);
          return new NextResponse('Database update failed', { status: 500 });
        }
      } else {
        console.error('PaymentIntent ID not found in charge object');
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
