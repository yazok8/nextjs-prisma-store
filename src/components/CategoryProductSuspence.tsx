// components/CategoryProductSuspense.tsx

import React from 'react';
import { ProductWithCategory } from '@/types/Category';
import { ProductCard } from './ProductCard';

type CategoryProductSuspenseProps = {
  products: ProductWithCategory[];
  layout: 'flex' | 'grid' | 'slider';
};

export function CategoryProductSuspense({
  products,
  layout,
}: CategoryProductSuspenseProps) {
  return (
    <>
      {products.map((product) =>
        layout === 'grid' ? (
          <ProductCard key={product.id} {...product} />
        ) : (
          <div key={product.id} className="w-[311px] sm:w-[280px] flex-shrink-0">
            <ProductCard {...product} />
          </div>
        )
      )}
    </>
  );
}
