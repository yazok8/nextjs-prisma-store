"use client";

import { useCart } from '@/app/webhooks/useCart';
import { Elements, useStripe } from '@stripe/react-stripe-js';
import { notFound, useRouter } from 'next/navigation';
import React, { useEffect, useState, useCallback } from 'react';
import dotenv from 'dotenv';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CartCheckoutForm from './CartCheckoutForm';
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
    if (cartProducts === null || cartProducts === undefined) {
      console.log("Cart is loading...");
      setIsCartLoading(true); 
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
            console.log("Cart Products:", cartProducts);
            setError("No products in the cart.");
            setIsLoading(false);
            return;
          }
        }
  
        const transformedCart = cartProducts?.map(item => ({
          id: item.id,
          name: item.name,
          image: item.imagePath,
          priceInCents: item.priceInCents,
          quantity: item.Quantity ?? 1,
        }));
  
        const paymentIntent = await handleCheckout(currentUser.email, transformedCart);
  
        if (paymentIntent?.error) {
          setError(paymentIntent.error);
          return;
        }
  
        if (paymentIntent?.clientSecret) {
          setClientSecret(paymentIntent.clientSecret);
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
    setIsCartLoading(false);
  }, [product, cartProducts, cartSubTotalAmount, isSingleProductCheckout]);
  

  /**
   * The handleCheckout function can be added here to trigger the checkout session.
   */
  async function handleCheckout(email: string, cartItems: any) {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems,
          email,
          isSingleProductCheckout,
        }),
      });
  
      if (!response.ok) {
        const { error } = await response.json();
        return { error };
      }
  
      const { id } = await response.json();
  
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if(!stripe) return notFound();
      await stripe.redirectToCheckout({ sessionId: id });
  
      return { clientSecret: id }; // Optionally return clientSecret
    } catch (error) {
      console.error('Error:', error);
      return { error: 'An error occurred during checkout.' };
    }
  }
  

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
