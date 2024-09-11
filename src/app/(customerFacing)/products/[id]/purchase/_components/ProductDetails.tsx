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

type ProductProps = {
  product: {
    id: string;
    imagePath: string;
    name: string;
    priceInCents: number;
    description: string;
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
  const { handleAddProductToCart, cartProducts } = useCart();

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
  }, [cartProducts]);

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

  return (
    <>
      <div className="flex flex-col gap-4 items-start h-full md:flex-row">
        <div className="aspect-video flex-shrink-0 w-4/12 relative justify-start md:w-1/12">
          <Image
            src={product.imagePath}
            fill
            alt={product.name}
            className="object-contain"
          />
        </div>
        <div className="aspect-video flex-shrink-0 w-1/2 relative justify-end md:w-1/4">
          <Image
            src={product.imagePath}
            fill
            alt={product.name}
            className="object-contain"
          />
        </div>

        <div className="flex flex-col">
          <div className="text-lg">
            {formatCurrency(product.priceInCents / 100)}
          </div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <HorizontalLine />
          {/* Remove height constraints and allow text to grow */}
          <div className="text-muted-foreground sm:pr-0">
            {product.description}
          </div>
          <HorizontalLine />
          <div className="flex flex-col">
            <span className="text-slate-500 font-semibold">Category</span>
            <span className="text-slate-500 font-semibold">Brand</span>
          </div>
          <HorizontalLine />
          <SetQuantity
            cartProduct={cartProduct}
            handleCartQuantityIncrease={handleCartQuantityIncrease}
            handleCartQuantityDecrease={handleCartQuantityDecrease}
          />
          <div className="space-y-3 mt-5">
            {isProductInCart ? (
              <div className="flex-col flex space-y-3">
                <p className="mb-2 text-slate-500 flex items-center justify-items-center gap-1">
                  <CheckCircle className="text-teal-400" size={20} />
                  Product added to cart
                </p>
                <Button
                  size="lg"
                  className="w-44 ml-0 text-center flex md:w-52"
                  onClick={() => router.push("/cart")}
                >
                  View cart
                </Button>
              </div>
            ) : (
              <>
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
        </div>
      </div>
    </>
  );
}
