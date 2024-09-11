import db from "@/db/db"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { Resend } from "resend"
import PurchaseReceiptEmail from "@/email/PurchaseReceipt"


// Initialize the Stripe and Resend instances with their respective API keys
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

// Handle POST requests sent to this API endpoint
export async function POST(req: NextRequest) {
  // Construct the Stripe event from the request to verify its authenticity
  const event = await stripe.webhooks.constructEvent(
    await req.text(), // Read the raw request body
    req.headers.get("stripe-signature") as string, // Get the Stripe signature from the headers
    process.env.STRIPE_WEBHOOK_SECRET as string // Get the webhook secret from environment variables
  );

  // Handle the "charge.succeeded" event type from Stripe
  if (event.type === "charge.succeeded") {
    const charge = event.data.object; 
    const productId = charge.metadata.productId; 
    const discountCodeId = charge.metadata.discountCodeId; 
    const email = charge.billing_details.email;
    const pricePaidInCents = charge.amount; 

    // Retrieve the purchased product from the database
    const product = await db.product.findUnique({ where: { id: productId } });
    if (product == null || email == null) {
      // If the product or email is not found, return a 400 Bad Request response
      return new NextResponse("Bad Request", { status: 400 });
    }

    // Prepare the fields for the user record (with an order creation)
    const userFields = {
      email,
      orders: { create: { productId, pricePaidInCents, discountCodeId } },
    };

    // Upsert the user record: create if it doesn't exist, update if it does
    const {
      orders: [order],
    } = await db.user.upsert({
      where: { email },
      create: userFields, 
      update: userFields, 
      select: { orders: { orderBy: { createdAt: "desc" }, take: 1 } }, // Select the most recent order
    });

    // Create a download verification record that expires in 24 hours
    const downloadVerification = await db.downloadVerification.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Set expiration time to 24 hours from now
      },
    });

    // If a discount code was used, increment its usage count
    if (discountCodeId != null) {
      await db.discountCode.update({
        where: { id: discountCodeId }, 
        data: { uses: { increment: 1 } }, 
      });
    }

    // Send a purchase receipt email to the customer
    await resend.emails.send({
      from: `Support <${process.env.SENDER_EMAIL}>`, // Set the sender email address
      to: email, // Send the email to the customer's email address
      subject: "Order Confirmation", // Set the subject of the email
      react: (
        <PurchaseReceiptEmail
          order={order} // Pass the order details to the email template
          product={product} // Pass the product details to the email template
          downloadVerificationId={downloadVerification.id} // Pass the download verification ID to the email template
        />
      ),
    });
  }

  // Return a 200 OK response after processing the event
  return new NextResponse();
}