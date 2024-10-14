// src/app/(customerFacing)/checkout/_components/CheckoutClient.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "@/app/webhooks/useCart";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, LinkAuthenticationElement } from "@stripe/react-stripe-js";
import CartCheckoutForm from "./CartCheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

export default function CheckoutClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { initializePaymentIntent, cartProducts, cartSubTotalAmount, clientSecret } = useCart();


  useEffect(() => {
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
      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <CartCheckoutForm totalAmount={cartSubTotalAmount} />
          
        </Elements>
        
      ) : (
        
        <div className="text-center">Loading payment details...</div>
      )}
         

    </div>
  );
}
