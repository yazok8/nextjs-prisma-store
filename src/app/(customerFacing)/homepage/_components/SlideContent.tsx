"use client";

import Image from 'next/image';
import { getImageSrc } from '@/lib/imageHelper';
import { Product } from '@prisma/client';
import { memo } from 'react';

interface SlideContentProps {
  product: Product;
  isActive: boolean;
}

const SlideContent = memo(function SlideContent({ product, isActive }: SlideContentProps) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
        isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
      }`}
    >
      <div className="relative w-full h-full">
        <Image
          src={getImageSrc(product.imagePath)}
          alt={`Image of ${product.name}`}
          layout="fill"
          objectFit="contain"
          priority={isActive}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
          className="rounded-lg"
        />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-white bg-opacity-60 p-4 rounded-lg max-w-xs md:max-w-sm text-center">
            <h2 className="text-xl md:text-2xl font-extrabold line-clamp-3">
              {product.name}
            </h2>
            <p className="mt-3 md:mt-5 text-lg line-clamp-3">
              Explore more about {product.name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default SlideContent;
