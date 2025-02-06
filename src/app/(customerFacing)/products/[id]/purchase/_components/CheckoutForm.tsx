// /components/ProductCheckoutForm.tsx

"use client";

import { formatCurrency} from "@/lib/formatters";
import {
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import {  useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { DiscountCodeType } from "@prisma/client";
import { getDiscountedAmount } from "@/lib/discountCodeHelper";
import { PaymentForm } from "./PaymentForm";
import { getImageSrc } from '@/lib/imageHelper';

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


  // Get search params to handle coupon
  const searchParams = useSearchParams();
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
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-center">
        <div className="aspect-video flex-shrink-0 w-1/6 relative">
          <Image
            src={getImageSrc(product.imagePath)}
            width={200}
            height={200}
            alt={product.name}
            className="object-contain min-w-[250px] min-h-[250px]"
          />
        </div>
        <div>
          <div className="text-lg flex gap-4 items-baseline">
            <div
              className={
                isDiscounted ? "line-through text-muted-foreground text-sm" : ""
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


