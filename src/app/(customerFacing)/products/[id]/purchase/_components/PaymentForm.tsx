"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatDiscountCode } from "@/lib/formatters";
import {
  AddressElement,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { FormEvent, useRef, useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { DiscountCodeType } from "@prisma/client";
import { useToast } from "@/components/ui/use-toast";

type PaymentFormProps = {
    priceInCents: number;
    productId: string;
    discountCode?: {
      id: string;
      discountAmount: number;
      discountType: DiscountCodeType;
    };
  };

export function PaymentForm({
    priceInCents,
    discountCode,
  }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
  
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [email, setEmail] = useState<string>("");
  
    const discountCodeRef = useRef<HTMLInputElement>(null);
    const searchParams = useSearchParams();
  
    const coupon = searchParams.get("coupon");
  
    async function handleSubmit(e: FormEvent) {
      e.preventDefault();
  
      if (stripe == null || elements == null) return;
  
      setIsLoading(true);
  
      const isProduction = process.env.NODE_ENV === "production";
      const return_url = isProduction
        ? `${process.env.NEXT_PUBLIC_PROD_URL}/stripe/cartSuccess`
        : `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/cartSuccess`;
  
      // Confirm the payment
  
      try {
        const { error } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchaseSuccess`,
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
      } catch (err) {
        toast({
          title: "Payment Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    }
  
    return (
      <form onSubmit={handleSubmit}>
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription className="text-destructive">
              {errorMessage && <div>{errorMessage}</div>}
              {coupon != null && discountCode == null && (
                <div>Invalid discount code</div>
              )}
            </CardDescription>
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
            <div className="space-y-2 mt-4">
              <Label htmlFor="discountedCode">Coupon</Label>
              <div className="flex gap-4 items-center">
                <Input
                  id="discountCode"
                  type="text"
                  name="discountCode"
                  defaultValue={coupon || ""}
                  className="max-w-xs w-full"
                  ref={discountCodeRef}
                  disabled={!!discountCode} // Disable if discount is already applied
                />
                {/* Optionally, you can remove or adjust the Apply button */}
                {/* 
                <Button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("coupon", discountCodeRef.current?.value || "");
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                  disabled={!!discountCode}
                >
                  Apply
                </Button>
                */}
                {discountCode != null && (
                  <div className="text-muted-foreground">
                    {formatDiscountCode(discountCode)} discount applied
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              disabled={stripe == null || elements == null || isLoading}
            >
              {isLoading
                ? "Purchasing..."
                : `Purchase - ${formatCurrency(priceInCents / 100)}`}
            </Button>
          </CardFooter>
        </Card>
      </form>
    );
  }