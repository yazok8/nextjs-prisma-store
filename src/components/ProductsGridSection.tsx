// ProductGridSection Component
import React, { Suspense } from "react";
import { ProductWithCategory } from "@/types/Category";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

type ProductGridSectionProps = {
    title: string;
    productsFetcher: () => Promise<ProductWithCategory[]>;
    layout?: "flex" | "grid"; // Optional prop to define layout
  };
  


export function ProductGridSection({
    productsFetcher,
    title,
    layout = "flex", // Default to flex layout
  }: ProductGridSectionProps) {
    // Define container classes based on layout prop
    const containerClasses =
      layout === "grid"
        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4"
        : "flex flex-wrap justify-center gap-4";
  
    return (
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex gap-4 items-center">
          <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
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
            <ProductSuspense productsFetcher={productsFetcher} layout={layout} />
          </Suspense>
        </div>
      </div>
    );
  }
  
  // ProductSuspense Component
  async function ProductSuspense({
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
              <div key={product.id} className="w-[250px] sm:w-[280px] flex-shrink-0">
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