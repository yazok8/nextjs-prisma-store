"use client"; // This ensures the component can use hooks like useEffect

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/app/webhooks/useCart"; // Hook to clear the cart
import Image from "next/image";
import Link from "next/link";

type CartSuccessClientType ={
    user:{ name: string | null; email: string };
    products: { id: string; name: string; imagePath: string; description: string }[];
    cart: { id: string; quantity: number }[];
    downloadVerifications: { productId: string; downloadVerificationId: string }[];
    isSuccess: boolean;
}

export default function CartSuccessClient({
    user,
    products,
    cart,
    downloadVerifications,
    isSuccess,
  }: CartSuccessClientType) {
    const { handleClearCart } = useCart();
  
    useEffect(() => {
      // Clear the cart after successful checkout
      handleClearCart();
    }, [handleClearCart]);
  
    return (
      <div className="max-w-5xl w-full mx-auto space-y-8">
        <h1 className="text-4xl font-bold">
          {isSuccess ? "Success!" : "Error!"}
        </h1>
  
        {/* Display user details */}
        <div className="p-4 bg-gray-100 rounded-md">
          <h2 className="text-2xl font-semibold">Customer Details</h2>
          <p>
            <strong>Name:</strong> {user.name || "Guest"} {/* Handle null name */}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
  
        <div className="space-y-6">
          {/* Iterate over products and display them */}
          {products.map((product) => {
            const cartItem = cart.find((item) => item.id === product.id);
            const downloadVerification = downloadVerifications.find(
              (dv) => dv.productId === product.id
            );
  
            return (
              <div key={product.id} className="flex gap-4 items-center">
                <div className="aspect-video flex-shrink-0 w-1/3 relative">
                  <Image
                    src={product.imagePath}
                    fill
                    alt={product.name}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{product.name}</h1>
                  <p className="text-muted-foreground">{product.description}</p>
                  <p className="text-muted-foreground">
                    Quantity: {cartItem?.quantity}
                  </p>
                  <Button className="mt-4" size="lg" asChild>
                    {isSuccess ? (
                      <a
                        href={`/products/download/${downloadVerification?.downloadVerificationId}`}
                      >
                        Download
                      </a>
                    ) : (
                      <Link href={`/products/${product.id}/purchase`}>
                        Try Again
                      </Link>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
