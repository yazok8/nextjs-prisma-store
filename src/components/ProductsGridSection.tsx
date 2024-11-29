// components/ProductGridSection.tsx

"use client";

import React from 'react';
import { ProductWithCategory } from '@/types/Category';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { ProductCard } from './ProductCard';
import { GenericSlider } from '@/app/(customerFacing)/homepage/_components/GenericSlider';
import { CategoryProductSuspense } from './CategoryProductSuspence';

type ProductGridSectionProps = {
  title: string;
  products: ProductWithCategory[];
  layout?: 'flex' | 'grid';
  categoryId?: string;
  enableSliderOnMobile?: boolean;
};

export function ProductGridSection({
  products,
  title,
  layout = 'flex',
  categoryId,
  enableSliderOnMobile = false,
}: ProductGridSectionProps) {
  const containerClasses =
    layout === 'grid'
      ? 'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4'
      : 'flex flex-wrap justify-center gap-4';

  // Determine if the slider should be enabled based on the number of products
  const shouldEnableSlider = enableSliderOnMobile && products.length >= 3;

  return (
    <div className="space-y-4">
      <div className="block md:flex md:py-0 gap-4 items-center">
        <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
        {categoryId && (
          <Button variant="outline" asChild>
            <Link
              href={`/category/${categoryId}`}
              className="flex items-center space-x-2 mb-10"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        )}
      </div>

      {/* Slider for mobile devices */}
      {shouldEnableSlider && (
        <div className="block sm:hidden">
          <GenericSlider>
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </GenericSlider>
        </div>
      )}

      {/* Grid/Flex layout for larger screens or when slider is disabled */}
      <div className={`${shouldEnableSlider ? 'hidden sm:block' : 'block'}`}>
        <div className={containerClasses}>
          <CategoryProductSuspense products={products} layout={layout} />
        </div>
      </div>
    </div>
  );
}
