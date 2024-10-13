// src/app/stripe/cartSuccess/page.tsx

"use client";

import React, { useEffect } from "react";
import { useCart } from "@/app/webhooks/useCart";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "../../_actions/user";

export default function CartSuccessPage() {
  const { handleClearCart, handleSetPaymentIntent } = useCart();
  
  const router = useRouter();

  useEffect(() => {
    handleClearCart();
    handleSetPaymentIntent(null);
    // Optionally, clear clientSecret from localStorage if stored
    localStorage.removeItem("eShopClientSecret");
  }, [handleClearCart, handleSetPaymentIntent]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Payment Successful</h1>
      <p className="mb-6">Your payment was successful, and your cart has been cleared.</p>
      <Button onClick={() => router.push("/orders")}>View Your Orders</Button>
    </div>
  );
}
