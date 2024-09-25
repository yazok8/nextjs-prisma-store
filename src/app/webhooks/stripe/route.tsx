import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import PurchaseReceiptEmail from "@/email/PurchaseReceipt";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("Missing Stripe signature");
    return new NextResponse("Missing Stripe signature", { status: 400 });
  }

  let event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return new NextResponse("Webhook signature verification failed", { status: 400 });
  }

  // Handle the event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Fetch the session to get additional data like customer_email
      const sessionId = session.id;
      const paymentIntentId = session.payment_intent as string;

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      const email = session.customer_details?.email;
      const cartMetadata = paymentIntent.metadata.cart ? JSON.parse(paymentIntent.metadata.cart) : null;

      if (!email || (!cartMetadata && !paymentIntent.metadata.productId)) {
        console.error("Missing email or cart metadata");
        return new NextResponse("Missing email or cart metadata", { status: 400 });
      }

      if (!cartMetadata) {
        // Single product checkout
        const productId = paymentIntent.metadata.productId;

        const product = await db.product.findUnique({ where: { id: productId } });
        if (!product) {
          console.error("Product not found");
          return new NextResponse("Bad Request: Product not found", { status: 400 });
        }

        const order = await db.order.create({
          data: {
            user: {
              connectOrCreate: {
                where: { email },
                create: { email },
              },
            },
            product: { connect: { id: product.id } },
            quantity: 1,
            pricePaidInCents: product.priceInCents,
          },
        });

        const downloadVerification = await db.downloadVerification.create({
          data: {
            productId: product.id,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
          },
        });

        await resend.emails.send({
          from: `Support <${process.env.SENDER_EMAIL}>`,
          to: email,
          subject: "Order Confirmation",
          react: (
            <PurchaseReceiptEmail
              orders={[{
                order,
                product,
                downloadVerificationId: downloadVerification.id,
              }]}
            />
          ),
        });

      } else {
        // Cart (multiple products) checkout
        const orders = await Promise.all(cartMetadata.map(async (item: { productId: string; quantity: number }) => {
          const product = await db.product.findUnique({ where: { id: item.productId } });
          if (!product) {
            return null;
          }

          const order = await db.order.create({
            data: {
              user: { 
                connectOrCreate: {
                  where: { email },
                  create: { email },
                },
              },
              product: { connect: { id: product.id } },
              quantity: item.quantity,
              pricePaidInCents: product.priceInCents * item.quantity,
            },
          });

          const downloadVerification = await db.downloadVerification.create({
            data: {
              productId: product.id,
              expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
          });

          return { order, product, downloadVerificationId: downloadVerification.id };
        }));

        const validOrders = orders.filter((o) => o !== null);

        await resend.emails.send({
          from: `Support <${process.env.SENDER_EMAIL}>`,
          to: email,
          subject: "Order Confirmation",
          react: (
            <PurchaseReceiptEmail
              orders={validOrders.map(({ order, product, downloadVerificationId }) => ({
                order,
                product,
                downloadVerificationId,
              }))}
            />
          ),
        });
      }

    } catch (error) {
      console.error("Error processing Stripe webhook:", error);
      return new NextResponse("Webhook error", { status: 500 });
    }
  }

  return new NextResponse("Webhook received", { status: 200 });
}
