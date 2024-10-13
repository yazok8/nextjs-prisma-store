// src/app/(customerFacing)/checkout/_components/CheckoutClient.tsx

"use client";

import React, { useEffect } from "react";
import { useCart } from "@/app/webhooks/useCart";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CartCheckoutForm from "./CartCheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

export default function CheckoutClient() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    initializePaymentIntent,
    cartProducts,
    cartSubTotalAmount,
    clientSecret,
  } = useCart();

  useEffect(() => {
    if (!cartProducts || cartProducts.length === 0) {
      router.push("/cart"); // Redirect to cart if no products
      return;
    }
    initializePaymentIntent(router, toast);
  }, [initializePaymentIntent, cartProducts, router, toast]);

  const options: StripeElementsOptions = {
    clientSecret: clientSecret || "",
    appearance: {
      theme: "stripe",
      labels: "floating",
    },
  };

  return (
    <div className="w-full">
      <Elements options={options} stripe={stripePromise}>
        <CartCheckoutForm totalAmount={cartSubTotalAmount} />
      </Elements>
    </div>
  );
}
