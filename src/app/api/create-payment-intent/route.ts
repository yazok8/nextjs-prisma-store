// src/app/api/create-payment-intent/route.ts

import { getCurrentUser } from "@/app/(customerFacing)/_actions/user";
import { CartProductType } from "@/app/(customerFacing)/products/[id]/purchase/_components/ProductDetails";
import db from "@/db/db";
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

    const total = calculateOrderAmount(items)/100;

    let paymentIntent: Stripe.PaymentIntent;

    if (payment_intent_id) {
      // **Update Existing Payment Intent**
      await stripe.paymentIntents.update(payment_intent_id, {
        amount: total,
      });

      // Retrieve the payment intent to get the client_secret
      paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    } else {
      // **Create New Payment Intent**
      paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        metadata: {
          userId: currentUser.id,
          productIds: items.map((item) => item.id).join(","),
          discountCodeId: discountCodeId || "",
        },
      });
    }

    // Start a transaction
// Inside your transaction
await db.$transaction(async (prisma) => {
    // Upsert the order
    await prisma.order.upsert({
      where: { paymentIntentId: paymentIntent.id },
      update: {
        userId: currentUser.id,
        pricePaidInCents: total,
        currency: "usd",
        status: "pending",
        deliveryStatus: "pending",
        discountCodeId: discountCodeId || null, // Use scalar field
      },
      create: {
        userId: currentUser.id,
        paymentIntentId: paymentIntent.id,
        pricePaidInCents: total,
        currency: "usd",
        status: "pending",
        deliveryStatus: "pending",
        discountCodeId: discountCodeId || undefined, // Use scalar field
      },
    });
  
    // Delete existing orderProducts for this order
    await prisma.orderProduct.deleteMany({
      where: {
        order: {
          paymentIntentId: paymentIntent.id,
        },
      },
    });
  
    // Create new orderProducts
    const order = await prisma.order.findUnique({
      where: { paymentIntentId: paymentIntent.id },
    });
  
    await prisma.orderProduct.createMany({
      data: items.map((item: CartProductType) => ({
        orderId: order!.id,
        productId: item.id,
        quantity: item.Quantity,
        price: item.priceInCents,
      })),
    });
  });
  

    // Respond with the payment intent details
    return NextResponse.json({ paymentIntent });
  } catch (error) {
    console.error("Error creating or updating payment intent:", error);

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
