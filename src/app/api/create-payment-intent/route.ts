// src/app/api/create-payment-intent/route.ts

import { getCurrentUser } from "@/app/(customerFacing)/_actions/user";
import { CartProductType } from "@/app/(customerFacing)/products/[id]/purchase/_components/ProductDetails";
import {prisma} from '@/lib/prisma';
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10",
});

const calculateOrderAmount = (items: CartProductType[]): number => {
  const totalPrice = items.reduce((acc, item) => {
    const itemTotal = item.priceInCents * item.Quantity;
    return acc + itemTotal;
  }, 0);
  return totalPrice;
};

interface CreatePaymentIntentRequest {
  items: CartProductType[];
  payment_intent_id?: string;
  discountCodeId?: string; // Optional
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreatePaymentIntentRequest = await req.json();
    const { items, payment_intent_id, discountCodeId } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Calculate the total amount in cents (Stripe expects amount in cents)
    const totalAmountInCents = calculateOrderAmount(items);

    // Start a transaction to create or update the order and order products
    const order = await prisma.$transaction(async (db) => {
      // Upsert the order
      const order = await db.order.upsert({
        where: { paymentIntentId: payment_intent_id || "" },
        update: {
          userId: currentUser.id,
          pricePaidInCents: totalAmountInCents,
          currency: "usd",
          status: "pending",
          deliveryStatus: "pending",
          discountCodeId: discountCodeId || null,
        },
        create: {
          userId: currentUser.id,
          paymentIntentId: "", // Temporary, will update after creating Payment Intent
          pricePaidInCents: totalAmountInCents,
          currency: "usd",
          status: "pending",
          deliveryStatus: "pending",
          discountCodeId: discountCodeId || undefined,
        },
      });

      // Delete existing orderProducts for this order if updating
      if (payment_intent_id) {
        await db.orderProduct.deleteMany({
          where: {
            orderId: order.id,
          },
        });
      }

      // Create new orderProducts
      await db.orderProduct.createMany({
        data: items.map((item: CartProductType) => ({
          orderId: order.id,
          productId: item.id,
          quantity: item.Quantity,
          price: item.priceInCents, // Use 'price' instead of 'priceInCents'
        })),
      });

      // Return the order object to be used outside the transaction
      return order;
    });

    // Now, create or update the Payment Intent outside the transaction
    let paymentIntent: Stripe.PaymentIntent;

    if (payment_intent_id) {
      // **Update Existing Payment Intent**
      paymentIntent = await stripe.paymentIntents.update(payment_intent_id, {
        amount: totalAmountInCents,
        metadata: {
          orderId: order.id,
          userId: currentUser.id,
        },
      });
    } else {
      // **Create New Payment Intent**
      paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmountInCents,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId: order.id,
          userId: currentUser.id,
        },
      });
    }

    // Update the order with the paymentIntentId
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: paymentIntent.id },
    });

    // Respond with the payment intent details
    return NextResponse.json({ paymentIntent });
  } catch (error) {
    console.error("Error creating or updating payment intent:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
