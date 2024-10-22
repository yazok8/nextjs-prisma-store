// /components/ProductCheckoutForm.tsx

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
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { FormEvent, useRef, useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DiscountCodeType } from "@prisma/client";
import { getDiscountedAmount } from "@/lib/discountCodeHelper";

// Initialize Stripe outside of the component to prevent re-creating on every render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);

type CheckoutFormProps = {
  product: {
    id: string;
    imagePath: string;
    name: string;
    priceInCents: number;
    description: string;
  };
  discountCode?: {
    id: string;
    discountAmount: number;
    discountType: DiscountCodeType;
  };
};

export default function ProductCheckoutForm({
  product,
  discountCode,
}: CheckoutFormProps) {
  // Calculate the final amount based on the discount
  const amount =
    discountCode == null
      ? product.priceInCents
      : getDiscountedAmount(discountCode, product.priceInCents);
  const isDiscounted = amount !== product.priceInCents;

  // State to hold clientSecret
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Refs for discount code input
  const discountCodeRef = useRef<HTMLInputElement>(null);

  // Get search params to handle coupon
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const coupon = searchParams.get("coupon");

  // Memoized function to create payment intent and get clientSecret
  const fetchClientSecret = useCallback(
    async (discountCodeId?: string) => {
      try {
        const response = await fetch("/api/create-payment-intent/single", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
            discountCodeId: discountCodeId || "",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create payment intent");
        }

        setClientSecret(data.clientSecret);
      } catch (error: any) {
        console.error("Error fetching client secret:", error);
        // Optionally, set an error state here to display to the user
      }
    },
    [product.id]
  );

  // Fetch clientSecret on component mount or when discount code changes
  useEffect(() => {
    // Initialize with the coupon if present
    fetchClientSecret(coupon || discountCode?.id);
  }, [coupon, discountCode, fetchClientSecret]);

  return (
    <div className="max-w-5xl w-full mx-auto space-y-8">
      <div className="flex gap-4 items-center">
        <div className="aspect-video flex-shrink-0 w-1/3 relative">
          <Image
            src={product.imagePath}
            fill
            alt={product.name}
            className="object-contain"
          />
        </div>
        <div>
          <div className="text-lg flex gap-4 items-baseline">
            <div
              className={
                isDiscounted
                  ? "line-through text-muted-foreground text-sm"
                  : ""
              }
            >
              {formatCurrency(product.priceInCents / 100)}
            </div>
            <div className="text-lg">
              {isDiscounted && formatCurrency(amount / 100)}
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <div className="line-clamp-3 text-muted-foreground">
              {product.description}
            </div>
          </div>
        </div>
      </div>
      {/* Only render Elements if clientSecret is available */}
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm
            priceInCents={amount}
            productId={product.id}
            discountCode={discountCode}
          />
        </Elements>
      ) : (
        <div>Loading payment...</div>
      )}
    </div>
  );
}

type PaymentFormProps = {
  priceInCents: number;
  productId: string;
  discountCode?: {
    id: string;
    discountAmount: number;
    discountType: DiscountCodeType;
  };
};

function PaymentForm({
  priceInCents,
  productId,
  discountCode,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const discountCodeRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const coupon = searchParams.get("coupon");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (stripe == null || elements == null) return;

    setIsLoading(true);

    // Confirm the payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchaseSuccess`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setErrorMessage(error.message || "An error occurred.");
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }

    setIsLoading(false);
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
