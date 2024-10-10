// src/app/(customerFacing)/checkout/_components/CartCheckoutForm.tsx

"use client";

import { useCart } from "@/app/webhooks/useCart";
import {
  LinkAuthenticationElement,
  PaymentElement,
  AddressElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/formatters";
import React, { FormEvent, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CartCheckoutFormProps {
  clientSecret: string;
  handleSetPaymentSuccess: (value: boolean) => void;
  totalAmount: number;
}

export default function CartCheckoutForm({
  clientSecret,
  handleSetPaymentSuccess,
  totalAmount,
}: CartCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>();
  // Removed handleClearCart and handleSetPaymentIntent since they will be called on the redirect page

  const total = totalAmount / 100;
  const formattedPrice = formatCurrency(total);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !email) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/cartSuccess`,
        // Optionally include receipt_email: email,
      },
    });

    if (error) {
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // The code below may not execute due to the redirection
    setIsLoading(false);
  };

  return (
    <form
      className="shadow-xl my-8"
      onSubmit={handleSubmit}
      id="payment-form"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl mx-2">Cart Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="font-semibold mb-2">Address Information</h2>
          <AddressElement
            options={{
              mode: "shipping",
              allowedCountries: ["US", "CA"],
            }}
          />
          <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
          <LinkAuthenticationElement
            onChange={(e) => setEmail(e.value.email)}
          />
        </CardContent>
        <CardFooter>
          <Button
            className="w-full text-2xl"
            size="lg"
            disabled={isLoading || !stripe || !elements}
          >
            {isLoading ? "Processing..." : `Pay ${formattedPrice}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
