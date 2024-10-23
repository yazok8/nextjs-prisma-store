// /app/api/create-payment-intent/single/route.ts

import { NextRequest, NextResponse } from "next/server"
import {prisma} from '@/lib/prisma'; // Adjust the import path based on your project structure
import Stripe from "stripe"
import { getServerSession } from "next-auth/next"

import { getDiscountedAmount } from "@/lib/discountCodeHelper"
import { z } from "zod"
import { authOptions } from "@/lib/auth"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10", // Ensure this matches your Stripe API version
})

// Define the expected shape of the request body using Zod for validation
const CreatePaymentIntentSchema = z.object({
  productId: z.string().nonempty("Product ID is required"),
  discountCodeId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Ensure the request is a POST request
    if (req.method !== "POST") {
      return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 })
    }

    // Retrieve user session to ensure the user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse and validate the request body
    const body = await req.json()
    const parsed = CreatePaymentIntentSchema.safeParse(body)

    if (!parsed.success) {
      // Extract the first error message from Zod
      const firstError = parsed.error.errors[0].message
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { productId, discountCodeId } = parsed.data

    // Fetch the product from the database
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Initialize the amount with the product's price
    let amount = product.priceInCents

    // If a discount code is provided, validate it and adjust the amount accordingly
    if (discountCodeId) {
      const discountCode = await prisma.discountCode.findUnique({
        where: { id: discountCodeId },
      })

      if (!discountCode) {
        return NextResponse.json({ error: "Invalid discount code" }, { status: 400 })
      }

      // Calculate the discounted amount based on the discount code type
      amount = getDiscountedAmount(discountCode, product.priceInCents)

      // Optionally, you can enforce a minimum amount after discount
      if (amount < 0) {
        amount = 0
      }
    }

    // Create a Stripe Payment Intent with the calculated amount and necessary metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd", // Adjust the currency as needed
      metadata: {
        userId: session.user.id,
        productId: product.id,
        discountCodeId: discountCodeId || "",
        checkoutType: "single",
      },
    })

    // Return the clientSecret to the frontend for initializing Stripe Elements
    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error: any) {
    console.error("Error creating single payment intent:", error)

    // Handle specific Stripe errors if needed
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Fallback for unexpected errors
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
