"use client";

import { formatCurrency } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/app/webhooks/useCart";
import { CartProductType } from "@/app/(customerFacing)/products/[id]/purchase/_components/ProductDetails";
import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProductCardProps = {
  id: string;
  name: string;
  priceInCents: number;
  description: string;
  imagePath: string;
  // Removed handleAddProductToCart from props
};

export function ProductCard({
  id,
  name,
  priceInCents,
  description,
  imagePath,
}: ProductCardProps) {
  const { handleAddProductToCart, cartProducts } = useCart();

  const [isProductInCart, setIsProductInCart] = useState(false);

  const [cartProduct, setCartProduct] = useState<CartProductType>({
    id: id,
    imagePath: imagePath,
    name: name,
    priceInCents: priceInCents,
    description: description,
    Quantity: 1,
  });

  useEffect(() => {
    const existsInCart = cartProducts?.some((item) => item.id === cartProduct.id);
    setIsProductInCart(!!existsInCart);
  }, [cartProducts, cartProduct.id]);


  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="relative w-full h-auto aspect-video">
        <Link href={`/products/${id}`} className="flex justify-center">
          <Image className="flex justify-center items-center" src={imagePath} objectFit="contain" width={300} height={50} alt={name} />
        </Link>
      </div>
      <CardHeader>
        <Link href={`/products/${id}`} className="flex flex-row justify-between">
          <CardTitle>{name}</CardTitle>
          <CardDescription className="font-bold text-black">{formatCurrency(priceInCents / 100)}</CardDescription>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow">
        <Link href={`/products/${id}`}>
          <p className="line-clamp-4">{description}</p>
        </Link>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {isProductInCart && (
          <p className="mb-2 text-slate-500 flex items-center gap-1">
            <CheckCircle className="text-teal-400" size={20} />
            Product added to cart
          </p>
        )}

        {isProductInCart ? (
          <Button asChild size="lg" variant="default" className="w-full">
            <Link href="/cart">View cart</Link>
          </Button>
        ) : (
          <Button size="lg" variant="default" className="w-full" onClick={() => handleAddProductToCart(cartProduct)}>
            Add To Cart
          </Button>
        )}

        <Button asChild size="lg" variant="default" className="w-full">
          <Link href={`/products/${id}/purchase`}>Purchase now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ProductCardSkeleton() {
    return (
      <Card className="flex flex-col overflow-hidden animate-pulse max-w-[85%] mx-auto">
        <div className="aspect-video bg-gray-300" />
        <CardHeader>
          <CardTitle>
            <div className="w-3/4 h-6 rounded-full bg-gray-300" />
          </CardTitle>
          <CardDescription>
            <div className="w-1/2 h-4 rounded-full bg-gray-300" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="w-full h-4 rounded-full bg-gray-300" />
          <div className="w-full h-4 rounded-full bg-gray-300" />
          <div className="w-3/4 h-4 rounded-full bg-gray-300" />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild size="lg" variant="default" className="w-full">
            <Link href="#">Loading...</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
