// src/app/(customerFacing)/checkout/_components/CheckoutClient.tsx

"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useCart } from "@/app/webhooks/useCart";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CartCheckoutForm from "./CartCheckoutForm";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

export default function CheckoutClient() {
  const router = useRouter();
  const { toast } = useToast();
  const { initializePaymentIntent, cartProducts, cartSubTotalAmount, clientSecret } = useCart();

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const totalAmount = cartSubTotalAmount;

  useEffect(() => {
    initializePaymentIntent(router, toast);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      labels: 'floating',
    },
  };

  const handleSetPaymentSuccess = useCallback((value: boolean) => {
    setPaymentSuccess(value);
  }, []);

  return (
    <div className="w-full">
      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <CartCheckoutForm
            clientSecret={clientSecret}
            handleSetPaymentSuccess={handleSetPaymentSuccess}
            totalAmount={totalAmount}
          />
        </Elements>
      ) : (
        <div className="text-center">Loading payment details...</div>
      )}
      {isLoading && <div className="text-center">Loading checkout...</div>}
      {error && <div className="text-center text-rose-500">Something went wrong</div>}
      {paymentSuccess && (
        <div className="flex items-center flex-col gap-4">
          <div className="text-teal-500">Payment Success</div>
          <div className="max-w-[220px] w-full">
            <Button onClick={() => router.push("/order")}>View your orders</Button>
          </div>
        </div>
      )}
    </div>
  );
}
