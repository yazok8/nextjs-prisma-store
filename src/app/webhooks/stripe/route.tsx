import db from "@/db/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import PurchaseReceiptEmail from "@/email/PurchaseReceipt";

// Initialize the Stripe and Resend instances with their respective API keys
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10", // Ensure you're using a specific API version
});
const resend = new Resend(process.env.RESEND_API_KEY as string);

// Handle POST requests sent to this API endpoint
export async function POST(req: NextRequest) {
  try {
    // Construct the Stripe event from the request to verify its authenticity
    const event = await stripe.webhooks.constructEvent(
      await req.text(), // Read the raw request body
      req.headers.get("stripe-signature") as string, // Get the Stripe signature from the headers
      process.env.STRIPE_WEBHOOK_SECRET as string // Get the webhook secret from environment variables
    );

    // Handle the "charge.succeeded" event type from Stripe
    if (event.type === "charge.succeeded") {
      const charge = event.data.object as Stripe.Charge;
      const productId = charge.metadata.productId;
      const discountCodeId = charge.metadata.discountCodeId;
      const email = charge.billing_details.email;
      const pricePaidInCents = charge.amount;

      // Retrieve the purchased product from the database
      const product = await db.product.findUnique({
        where: { id: productId },
      });

      if (!product || !email) {
        return new NextResponse("Bad Request", { status: 400 });
      }

      // Prepare user creation or update data
      const userData = {
        email,
        orders: {
          create: {
            pricePaidInCents,
            discountCode: discountCodeId
              ? { connect: { id: discountCodeId } }
              : undefined,
            orderProducts: {
              create: {
                product: { connect: { id: product.id } }, // Correctly connect the product
                quantity: 1, // Single product checkout
                price: pricePaidInCents, // Price at the time of purchase
              },
            },
          },
        },
      };

      // Upsert the user and create or update the order
      const {
        orders: [order],
      } = await db.user.upsert({
        where: { email },
        create: userData,
        update: userData,
        select: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: 1,
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
          },
        },
      });

      if (!order) {
        return new NextResponse("Bad Request", { status: 400 });
      }

      // Create download verification for the product
      const downloadVerification = await db.downloadVerification.create({
        data: {
          productId: product.id,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24-hour expiration
        },
      });

      // If a discount code was used, increment its usage count
      if (discountCodeId) {
        await db.discountCode.update({
          where: { id: discountCodeId },
          data: { uses: { increment: 1 } },
        });
      }

      // Extract the product from the order's orderProducts
      const orderProduct = order.orderProducts[0]; // Assuming single product
      const purchasedProduct = orderProduct.product;

      // Send purchase receipt email
      await resend.emails.send({
        from: `Support <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: "Order Confirmation",
        react: (
          <PurchaseReceiptEmail
            order={order}
            product={purchasedProduct}
            downloadVerificationId={downloadVerification.id}
          />
        ),
      });
    }

    return new NextResponse();
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
