// src/app/(customerFacing)/checkout/_components/CartCheckoutForm.tsx

"use client";

import {
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
  LinkAuthenticationElement,
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
import { ensureScheme } from "@/lib/helperSchema";

interface CartCheckoutFormProps {
  totalAmount: number;
}

export default function CartCheckoutForm({ totalAmount }: CartCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const formattedPrice = formatCurrency(totalAmount / 100);

  const [email, setEmail] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Stripe not loaded",
        description: "Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Determine the return URL based on the environment
    const isProduction = process.env.NODE_ENV === "production";
    const baseUrl = isProduction
    ? ensureScheme(process.env.NEXT_PUBLIC_PROD_URL || "")
    : ensureScheme(process.env.NEXT_PUBLIC_SERVER_URL || "", "http://");

    const return_url = `${baseUrl}/stripe/cartSuccess`;

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url,
          receipt_email: email, // Include the email for receipt
        },
      });

      if (error) {
        toast({
          title: "Payment Error",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // The redirect will happen automatically if no error
    } catch (err) {
      toast({
        title: "Payment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
    <Card className="border-none">
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>
      <CardContent>
        <AddressElement
          options={{
            mode: "shipping",
            allowedCountries: ["US", "CA"],
          }}
        />
        <PaymentElement />
        <LinkAuthenticationElement
          onChange={(e) => setEmail(e.value.email)}
        />
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          disabled={stripe == null || elements == null || isLoading}
        >
          {isLoading
            ? "Purchasing..."
            : `Purchase - ${formattedPrice}`}
        </Button>
      </CardFooter>
    </Card>
  </form>
  );
}
