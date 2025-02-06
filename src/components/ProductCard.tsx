"use client";

import { CartProductType } from "@/app/(customerFacing)/products/[id]/purchase/_components/ProductDetails";
import { useCart } from "@/app/webhooks/useCart/CartContext";
import { ProductWithCategory } from "@/types/Category";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { getImageSrc } from "@/lib/imageHelper";

export function ProductCard({
  id,
  name,
  priceInCents,
  description,
  imagePath,
}: ProductWithCategory) {
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
    const existsInCart = cartProducts?.some(
      (item) => item.id === cartProduct.id
    );
    setIsProductInCart(!!existsInCart);
  }, [cartProducts, cartProduct.id]);

  const imageSrc = getImageSrc(imagePath);

  return (
    <Card className="flex flex-col overflow-hidden w-full max-w-[280px] mx-auto border-none">
      <div className="relative w-full pt-[100%]"> {/* Use padding-top for aspect ratio */}
        <Link href={`/products/${id}`} className="absolute inset-0">
          <Image
            className="object-contain"
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = "/fallback-image.png";
              img.srcset = "";
            }}
          />
        </Link>
      </div>
      <CardHeader>
        <Link href={`/products/${id}`} className="flex flex-col justify-between">
          <CardTitle className="line-clamp-1">{name}</CardTitle>
          <CardDescription className="font-bold text-black">
            {formatCurrency(priceInCents / 100)}
          </CardDescription>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow">
        <Link href={`/products/${id}`}>
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        </Link>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {isProductInCart && (<>
          <p className="mb-2 text-slate-500 flex items-center gap-1">
            <CheckCircle className="text-teal-400" size={20} />
            Product added to cart
          </p>
       </> )}

        {isProductInCart ? (
          <>          <Button asChild size="lg" variant="default" className="w-full">
            <Link href="/cart">View cart</Link>
          </Button>
          </>
        ) : (
          <>
          <Button
            size="lg"
            variant="default"
            className="w-full"
            onClick={() => handleAddProductToCart(cartProduct)}
          >
            Add To Cart
          </Button>
          </>

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
      <div className="relative pt-[100%] bg-gray-300" />
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
        <Button disabled size="lg" variant="default" className="w-full">
          Loading...
        </Button>
      </CardFooter>
    </Card>
  );
}