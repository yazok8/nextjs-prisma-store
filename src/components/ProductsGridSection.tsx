// ProductGridSection Component
import React, { Suspense } from "react";
import { ProductWithCategory } from "@/types/Category";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type ProductGridSectionProps = {
    title: string;
    productsFetcher: () => Promise<ProductWithCategory[]>;
    layout?: "flex" | "grid";
    categoryId?: string; 
};

export function ProductGridSection({
  productsFetcher,
  title,
  layout = "flex",
  categoryId,
}: ProductGridSectionProps) {
  // Define container classes based on layout prop
  const containerClasses =
      layout === "grid"
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4"
          : "flex flex-wrap justify-center gap-4";

  // Debugging Log
  console.log(`ProductGridSection - categoryId: ${categoryId}`);

  return (
      <div className="space-y-4">
          {/* Section Header */}
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

          {/* Products Container */}
          <div className={containerClasses}>
              <Suspense
                  fallback={
                      <>
                          <ProductCardSkeleton />
                          <ProductCardSkeleton />
                          <ProductCardSkeleton />
                          <ProductCardSkeleton />
                      </>
                  }
              >
                  <CategoryProductSuspense productsFetcher={productsFetcher} layout={layout} />
              </Suspense>
          </div>
      </div>
  );
}



// ProductSuspense Component
export async function CategoryProductSuspense({
    productsFetcher,
    layout,
}: {
    productsFetcher: () => Promise<ProductWithCategory[]>;
    layout: "flex" | "grid";
}) {
    try {
        const products = await productsFetcher();
        return (
            <>
                {products.map((product) =>
                    layout === "grid" ? (
                        <ProductCard key={product.id} {...product} />
                    ) : (
                        <div key={product.id} className="w-[311px] sm:w-[280px] flex-shrink-0">
                            <ProductCard {...product} />
                        </div>
                    )
                )}
            </>
        );
    } catch (error) {
        console.error("Error fetching product grid section:", error);
        return (
            <div className="w-full h-full flex items-center justify-center text-red-500">
                <p>Failed to load products.</p>
            </div>
        );
    }
}
