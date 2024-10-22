

import React, { Suspense } from "react";
import getProducts, { IProductParams } from "@/actions/products";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { cache } from "@/lib/cache";
import { Product, Category as PrismaCategory, Category } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import db from "@/db/db";
import { ProductWithCategory } from "@/types/Category";
import { getAllCategoriesWithProducts,getMostNewestProducts, getProductsByCategory } from "@/actions/categories";
import { ProductGridSection } from "@/components/ProductsGridSection";
import { shuffleArray } from "@/lib/utils";

// Props Interfaces

interface HomeProps {
  searchParams: IProductParams;
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

