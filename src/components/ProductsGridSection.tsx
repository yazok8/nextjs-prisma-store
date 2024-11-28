import React from 'react';
import { ProductWithCategory } from '@/types/Category';
import {CategoryProductSuspense} from './CategoryProductSuspence';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type ProductGridSectionProps = {
  title: string;
  productsFetcher: () => Promise<ProductWithCategory[]>;
  layout?: 'flex' | 'grid';
  categoryId?: string;
};

export function ProductGridSection({
  productsFetcher,
  title,
  layout = 'flex',
  categoryId,
}: ProductGridSectionProps) {
  const containerClasses =
    layout === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4'
      : 'flex flex-wrap justify-center gap-4';

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
        {categoryId && (
          <Button variant="outline" asChild>
            <Link href={`/category/${categoryId}`} className="flex items-center space-x-2">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        )}
      </div>

      <div className={containerClasses}>
        <CategoryProductSuspense productsFetcher={productsFetcher} layout={layout} />
      </div>
    </div>
  );
}
