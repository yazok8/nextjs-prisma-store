"use client";

import { useCart } from '@/app/webhooks/useCart';
import { Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import dotenv from 'dotenv';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CartCheckoutForm from './CartCheckoutForm';
import { createPaymentIntent } from '@/actions/orders';
import { getCurrentUser } from '../../_actions/user';

dotenv.config({ path: "./.env" });

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string);

export default function CheckoutClient({ product }: { product?: { id: string; priceInCents: number } }) {
  const { cartProducts, cartSubTotalAmount } = useCart(); // Cart details from the custom hook
  const [isLoading, setIsLoading] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(true); // New state to track cart loading
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const router = useRouter();

  // Determine if this is a single product checkout or a cart checkout
  const isSingleProductCheckout = !!product; // If product is passed, it's a single product checkout

  const totalAmount = isSingleProductCheckout
    ? product?.priceInCents ?? 0
    : cartSubTotalAmount; // Calculate total based on cart or single product

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      labels: 'floating',
    },
  };

  const handleSetPaymentSuccess = useCallback((val: boolean) => {
    setPaymentSuccess(val);
  }, []);

  useEffect(() => {
    // Add a delay for cart initialization if needed
    if (cartProducts === null || cartProducts === undefined) {
      console.log("Cart is loading...");
      setIsCartLoading(true); // Set cart loading state
      return;
    }

    async function initiatePayment() {
      try {
        setIsLoading(true);

        const currentUser = await getCurrentUser();
        if (!currentUser?.email) {
          setError("User not logged in. Please log in to proceed.");
          setIsLoading(false);
          return;
        }

        if (isSingleProductCheckout) {
          if (!product?.id) {
            setError("Product ID is missing for single product checkout.");
            setIsLoading(false);
            return;
          }
        } else {
          if (!cartProducts || cartProducts.length === 0) {
            console.log("Cart Products:", cartProducts); // For debugging
            setError("No products in the cart.");
            setIsLoading(false);
            return;
          }
        }

        // Transform cart products to include 'quantity' field if necessary
        const transformedCart = cartProducts?.map(item => ({
          id: item.id,
          name:item.name,
          image:item.imagePath,
          priceInCents: item.priceInCents,
          quantity: item.Quantity ?? 1, // Ensure that 'quantity' is added
        }));

        // Create payment intent based on whether it's a single product or a cart checkout
        const paymentIntent = await createPaymentIntent(
          currentUser.email, // Use actual email from currentUser
          isSingleProductCheckout ? product?.id : undefined, // Pass productId for single product checkout, or undefined for cart checkout
          undefined, // No discount code provided in this case
          isSingleProductCheckout ? undefined : transformedCart // Pass transformed cart for multi-product checkout
        );

        if (paymentIntent.error) {
          setError(paymentIntent.error);
          return;
        }

        // Ensure clientSecret is valid before setting it
        if (paymentIntent.clientSecret) {
          setClientSecret(paymentIntent.clientSecret); // Only set if clientSecret is defined
        } else {
          setError("No client secret returned.");
        }
      } catch (error) {
        setError("An unexpected error occurred.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    initiatePayment();
    setIsCartLoading(false); // Once cartProducts is available, loading is complete
  }, [product, cartProducts, cartSubTotalAmount, isSingleProductCheckout]);

  return (
    <>
      <div className="w-full">
        {isCartLoading && <div className="text-center">Loading Cart...</div>}
        {!isCartLoading && clientSecret && (isSingleProductCheckout || cartProducts) && (
          <Elements options={options} stripe={stripePromise}>
            <CartCheckoutForm
              clientSecret={clientSecret}
              handleSetPaymentSuccess={handleSetPaymentSuccess}
              isSingleProductCheckout={isSingleProductCheckout} // Pass flag for form behavior
              product={product} // Single product if applicable
              cartProducts={cartProducts ?? undefined} // Cart products for cart checkout
              totalAmount={totalAmount} // Total amount for the checkout
            />
          </Elements>
        )}
        {isLoading && <div className="text-center">Loading Checkout...</div>}
        {error && <div className="text-center text-rose-500">{error}</div>}
        {paymentSuccess && (
          <Card className="flex flex-col justify-center item-center text-center shadow-2xl mt-[18rem] max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-teal-500 text-base">Payment Success</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="w-full">
                <Button onClick={() => router.push('/orders')}>View Your Orders</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
