import { notFound } from "next/navigation";
import Stripe from "stripe";
import db from "@/db/db";
import CartSuccessClient from "../../cart/_components/CartSuccessClient";

// Initialize Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
});

type CartItemType = {
  id: string;
  name: string;
  priceInCents: number;
  quantity: number;
};

const calculateOrderAmount = (items: CartItemType[]) => {
  const totalPrice = items.reduce((acc, item) => {
    const itemTotal = item.priceInCents * item.quantity;
    return acc + itemTotal;
  }, 0);
  return totalPrice;
};

export default async function CartSuccessPage({
  searchParams
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;
  if (!sessionId) {
    console.error("No session_id found in query params");
    return notFound();
  }

  try {
    // Retrieve the Checkout Session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      console.error("Stripe session not found");
      return notFound();
    }

    const cartMetadata = session.metadata?.cart;
    const userEmail = session.metadata?.userEmail;

    if (!cartMetadata || !userEmail) {
      console.error("User email or cart metadata is missing");
      return notFound();
    }

    // Parse the cart items from metadata
    const cart = JSON.parse(cartMetadata) as CartItemType[];

    // Fetch user details
    const user = await db.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error("User not found");
      return notFound();
    }

    // Check if the order already exists to avoid duplication
    const existingOrder = await db.order.findUnique({
      where: { sessionId }
    });

    if (existingOrder) {
      console.log("Order already exists in the database.");
    } else {
      // Create the order if it doesn't exist
      const total = calculateOrderAmount(cart) / 100;

      await db.order.create({
        data: {
          user: {
            connect: { id: user.id }
          },
          pricePaidInCents: total,
          currency: 'usd',
          status: session.payment_status,
          sessionId, // Store the sessionId in the order
          products: {
            create: cart.map(item => ({
              product: {
                connect: { id: item.id }
              },
              quantity: item.quantity,
              pricePaidInCents: item.priceInCents * item.quantity
            }))
          }
        }
      });
    }

    // Fetch products from the database
    const products = await db.product.findMany({
      where: { id: { in: cart.map(item => item.id) } },
    });

    if (!products || products.length === 0) {
      console.error("No valid products found");
      return notFound();
    }

    // Assume the payment was successful
    const isSuccess = session.payment_status === "paid";

    // Create download verifications for each product
    const downloadVerifications = await Promise.all(
      products.map(async (product) => ({
        productId: product.id,
        downloadVerificationId: await createDownloadVerification(product.id),
      }))
    );

    // Pass data to the client component
    return (
      <CartSuccessClient
        user={user}
        products={products}
        cart={cart}
        downloadVerifications={downloadVerifications}
        isSuccess={isSuccess}
      />
    );
  } catch (error) {
    console.error("Error retrieving payment intent or session:", error);
    return notFound();
  }
}

// Helper function to create download verification for each product
async function createDownloadVerification(productId: string) {
  return (
    await db.downloadVerification.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24-hour expiration
      },
    })
  ).id;
}
