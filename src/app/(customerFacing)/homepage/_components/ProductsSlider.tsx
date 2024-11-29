// components/ProductSlider.tsx

"use client";

import { Product } from '@prisma/client';
import Image from 'next/image';
import { getImageSrc } from '@/lib/imageHelper';
import { GenericSlider } from './GenericSlider'; 

interface ProductSliderProps {
  products: Product[];
}

export function ProductSlider({ products }: ProductSliderProps) {
  return (
    <GenericSlider>
      {products.map((product) => (
        <div key={product.id} className="relative w-full h-full">
          <Image
            src={getImageSrc(product.imagePath)}
            alt={`Image of ${product.name}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            className="rounded-lg object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-white bg-opacity-60 p-4 rounded-lg max-w-xs md:max-w-sm text-center">
              <h2 className="text-xl md:text-2xl font-extrabold line-clamp-1 md:line-clamp-3">
                {product.name}
              </h2>
              <p className="mt-3 md:mt-5 text-lg line-clamp-1 md:line-clamp-1">
                Explore more about {product.name}
              </p>
            </div>
          </div>
        </div>
      ))}
    </GenericSlider>
  );
}
