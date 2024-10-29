"use client";

import { formatCurrency } from "@/lib/formatters";
import Image from "next/image";

import Link from "next/link";
import { useCart } from "@/app/webhooks/useCart";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import SetQuantity from "../../../_components/SetQuantity";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type ProductProps = {
  product: {
    id: string;
    imagePath: string;
    name: string;
    priceInCents: number;
    description: string;
    category:string
    brand:string | null
  };
};

export type CartProductType = {
  id: string;
  imagePath: string;
  name: string;
  priceInCents: number;
  description: string;
  Quantity: number;
};

export default function ProductDetails({ product }: ProductProps) {
  const { handleAddProductToCart, cartProducts, handleRemoveCartProduct } = useCart();

  const [isProductInCart, setIsProductInCart] = useState(false);

  const [cartProduct, setCartProduct] = useState<CartProductType>({
    id: product.id,
    imagePath: product.imagePath,
    name: product.name,
    priceInCents: product.priceInCents,
    description: product.description,
    Quantity: 1,
  });

  const router = useRouter();

  useEffect(() => {
    setIsProductInCart(false);

    if (cartProducts) {
      const existingIndex = cartProducts.findIndex(
        (item) => item.id === product.id
      );

      if (existingIndex > -1) {
        setIsProductInCart(true);
      }
    }
  }, [cartProducts,product.id]);

  const HorizontalLine = () => {
    return <hr className="w-[30%] my-2" />;
  };

  const handleCartQuantityIncrease = useCallback(() => {
    if (cartProduct.Quantity === 99) {
      return;
    }

    setCartProduct((prev) => {
      return { ...prev, Quantity: prev.Quantity + 1 };
    });
  }, [cartProduct]);

  const handleCartQuantityDecrease = useCallback(() => {
    if (cartProduct.Quantity === 1) {
      return;
    }
    setCartProduct((prev) => {
      return { ...prev, Quantity: prev.Quantity - 1 };
    });
  }, [cartProduct]);

    // Helper function to determine the correct image source
    const getImageSrc = (path: string): string => {
      if (path.startsWith("http://") || path.startsWith("https://")) {
        // Absolute URL (e.g., images hosted on a CDN or external server)
        return path;
      } else if (path.startsWith("/")) {
        // Relative path (e.g., images stored in the public folder)
        return path;
      } else {
        // Assume the image is stored on S3
        return `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}/${path}`;
      }
    };
  
    const imageSrc = getImageSrc(product.imagePath);

  return (
    <>
      <div className="flex flex-col gap-4 items-start h-full md:flex-row">
        <div className="aspect-video flex-shrink-0 w-4/12 relative justify-start md:w-1/12">
          <Image
            src={imageSrc}
            fill
            alt={product.name}
            className="object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/fallback-image.png"; // Path to your fallback image
            }}
          />
        </div>
        <div className="aspect-video flex-shrink-0 w-1/2 relative justify-end md:w-1/4">
        <Image
            className="flex justify-center items-center object-contain object-center"
            src={imageSrc}
            fill
            alt={product.name}
            sizes="(max-width: 768px) 100vw,
                   (max-width: 1200px) 50vw,
                   33vw"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/fallback-image.png"; // Path to your fallback image
            }}
          />
        </div>

        <Card className="flex flex-col border-none">
          <CardHeader className="text-lg flex">
          <CardTitle className="text-2xl font-bold p-0">{product.name}</CardTitle>
            {formatCurrency(product.priceInCents / 100)}
          </CardHeader>

          <HorizontalLine />
          {/* Remove height constraints and allow text to grow */}
          <CardDescription className="text-muted-foreground sm:pr-0">
            {product.description}
          </CardDescription>
          <HorizontalLine />
          <div className="flex flex-col">
          <span className="text-slate-500 font-semibold">brand: {product.brand}</span>
            <span className="text-slate-500 font-semibold">Category: {product.category}</span>
          </div>
          <HorizontalLine />
          <div className="space-y-3 mt-5">
            {isProductInCart ? (
              <div className="flex-col flex space-y-3">
                <p className="mb-2 text-slate-500 flex items-center justify-items-center gap-1">
                  <CheckCircle className="text-teal-400" size={20} />
                  Product added to cart
                </p>
                <Button
                  size="lg"
                  className="text-center flex md:w-52"
                  onClick={() => handleRemoveCartProduct(cartProduct)}
                >
                  Remove From Cart
                </Button>
                <Button
                  size="lg"
                  className="ml-0 text-center flex md:w-52"
                  onClick={() => router.push("/cart")}
                >
                  View cart
                </Button>
              </div>
            ) : (
              <>
                       <SetQuantity
            cartProduct={cartProduct}
            handleCartQuantityIncrease={handleCartQuantityIncrease}
            handleCartQuantityDecrease={handleCartQuantityDecrease}
          />
                <Button
                  size="lg"
                  className="text-center flex w-52"
                  onClick={() => handleAddProductToCart(cartProduct)}
                >
                  Add to Cart
                </Button>
                <Button asChild size="lg" className="text-center flex w-52">
                  <Link href={`/products/${product.id}/purchase`}>
                    Purchase Now
                  </Link>
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
