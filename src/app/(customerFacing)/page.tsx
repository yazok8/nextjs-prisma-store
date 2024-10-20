

import React, { Suspense } from "react";
import getProducts, { IProductParams } from "@/actions/products";
import getAllCategories from "@/actions/categories";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { cache } from "@/lib/cache";
import { Product, Category as PrismaCategory } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import db from "@/db/db";

// Type Definitions

export type Category = PrismaCategory;

export interface ProductWithCategory extends Product {
  category: Category | null;
}

// Utility Functions

// Fisher-Yates shuffle algorithm to shuffle products
export function shuffleArray(array: ProductWithCategory[]): ProductWithCategory[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Data Fetching Functions

export const getProductsByCategory = cache(
  (categoryId: string): Promise<ProductWithCategory[]> => {
    return db.product.findMany({
      where: {
        isAvailableForPurchase: true,
        categoryId: categoryId,
      },
      include: {
        category: true,
      },
      take: 6,
    });
  },
  ["/", "getProductsByCategory"],
  { revalidate: 60 * 60 * 24 } // Cache for 24 hours
);

const getMostNewestProducts = cache(
  (): Promise<ProductWithCategory[]> => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { createdAt: "desc" },
      include: { category: true },
      take: 6,
    });
  },
  ["/", "getMostNewestProducts"],
  { revalidate: 60 * 60 * 24 }
);

// Props Interfaces

interface HomeProps {
  searchParams: IProductParams;
}

type ProductGridSectionProps = {
  title: string;
  productsFetcher: () => Promise<ProductWithCategory[]>;
  layout?: "flex" | "grid"; // Optional prop to define layout
};

// Components

// ProductGridSection Component
function ProductGridSection({
  productsFetcher,
  title,
  layout = "flex", // Default to flex layout
}: ProductGridSectionProps) {
  // Define container classes based on layout prop
  const containerClasses =
    layout === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      : "flex flex-wrap gap-4";

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

// Homepage Component
export default async function Homepage({ searchParams }: HomeProps) {
  try {
    // Fetch all categories that have at least one available product
    const categories: Category[] = await getAllCategoriesWithProducts();

    // Fetch products based on search parameters (optional)
    const products = await getProducts(searchParams);

    // Handle no search results (optional)
    if (products.length === 0 && searchParams.search) {
      return (
        <main className="space-y-9">
          <ProductGridSection
            title={`No Search Results found for "${searchParams.search}"`}
            productsFetcher={() => getMostNewestProducts()}
            layout="flex" // Use flex layout for this section
          />
        </main>
      );
    }

    // Determine if a search is being performed (optional)
    const isSearching =
      searchParams.search && searchParams.search.trim() !== "";
    const shuffledProducts = isSearching
      ? shuffleArray(products as ProductWithCategory[])
      : [];

    return (
      <>
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-center">
          {/* "View All Products" Button */}
          <div className="col-span-1 lg:col-span-2 flex justify-end">
            <Button variant="outline" asChild>
              <Link href="/products" className="flex items-center space-x-2">
                <span>View All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Search Results Section (Optional) */}
          {isSearching && (
            <div className="col-span-1 lg:col-span-2">
              <ProductGridSection
                title={`Search Results for "${searchParams.search}"`}
                productsFetcher={() => Promise.resolve(shuffledProducts)}
                layout="flex" // Use flex layout for search results
              />
            </div>
          )}

          {/* Dynamically render ProductGridSection for each category */}
          {categories.map((category) => (
            <div key={category.id} className="w-full max-w-[750px]">
              <ProductGridSection
                title={category.name}
                productsFetcher={() => getProductsByCategory(category.id)}
                layout="flex" // Use flex layout for categories
              />
            </div>
          ))}
        </main>

        {/* "Our Newest Products" Section */}
        <div className="mt-12">
          <ProductGridSection
            title="Our Newest Products"
            productsFetcher={() => getMostNewestProducts()}
            layout="grid" // Use grid layout for newest products
          />
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching products or categories:", error);
    return (
      <div className="w-full h-[50vh] flex items-center justify-center text-xl md:text-2xl">
        <p className="font-medium text-red-500">
          An error occurred while fetching products. Please try again later.
        </p>
      </div>
    );
  }
}

// Modified getAllCategories to fetch only categories with available products
async function getAllCategoriesWithProducts(): Promise<Category[]> {
  return cache(
    (): Promise<Category[]> => {
      return db.category.findMany({
        where: {
          products: {
            some: {
              isAvailableForPurchase: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });
    },
    ["/", "getAllCategoriesWithProducts"],
    { revalidate: 60 * 60 * 24 } // Cache for 24 hours
  )();
}
