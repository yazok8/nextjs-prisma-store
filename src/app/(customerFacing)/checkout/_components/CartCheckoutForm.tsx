"use client";

import { useCart } from "@/app/webhooks/useCart";
import {
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  AddressElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/formatters";
import React, { FormEvent, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

interface CheckoutFormInterface {
  clientSecret: string;
  handleSetPaymentSuccess: (value: boolean) => void;
}

export default function CartCheckoutForm({
  clientSecret,
  handleSetPaymentSuccess,
  isSingleProductCheckout,
  product,
  cartProducts,
  totalAmount,
}: {
  clientSecret: string;
  handleSetPaymentSuccess: (value: boolean) => void;
  isSingleProductCheckout: boolean;
  product?: { id: string; priceInCents: number };
  cartProducts?: { id: string; name: string; priceInCents: number; Quantity: number; }[];
  totalAmount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>();
  
  const formattedPrice = formatCurrency(totalAmount);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !email) return;

    setIsLoading(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/cartSuccess`,
      },
    });

    if (result.error) {
      toast({
        title: 'Payment Error',
        description: result.error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Checkout Success",
      description: "Payment completed successfully!",
    });

    handleSetPaymentSuccess(true);
    setIsLoading(false);
  };
  return (
    <>
    <form className="shadow-xl my-8" onSubmit={handleSubmit} id="payment-form">
       {/* Display single product or cart items */}
           {/* {isSingleProductCheckout ? (
            <>
            <div>{product?.name}</div> 
            </>
          ) : (
            <ul>
              {cartProducts?.map((item) => (
                <li key={item.id}>
                  {item.name} - {item.Quantity} x {formatCurrency(item.priceInCents / 100)}
                </li>
              ))}
            </ul>
          )} */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl mx-2">
            {isSingleProductCheckout ? "Checkout - Single Product" : "Checkout - Cart"}
          </CardTitle>
        </CardHeader>
        <CardContent>
        <h2 className="font-semibold mb-2"> Address Information</h2>
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

          <div className="py-4 text-center text-slate-700 text-xl font-bold">
            Total: {formattedPrice}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            size="lg"
            disabled={isLoading || !stripe || !elements}
          >
            {isLoading ? "Processing..." : `Pay ${formattedPrice}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
    </>
  );
}
