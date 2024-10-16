// src/app/(customerFacing)/homepage/page.tsx

import getProducts, { IProductParams } from "@/actions/products";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import db from "@/db/db";
import { cache } from "@/lib/cache";
import { Product } from "@prisma/client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface HomeProps{
  searchParams: IProductParams;
}

  //Fisher-Yates shuffle algorithm to search for products
  function shuffleArray(array: Product[]): Product[] {
    const shuffled = [...array];
    for(let i = shuffled.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

const getMostPopularProducts = cache(() => {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { orderProducts: { _count: "desc" } },
    take: 6,
  });
}, ["/", "getMostPopularProducts"], { revalidate: 60 * 60 * 24 });

const getMostNewestProducts = cache(() => {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}, ["/", "getMostNewestProducts"], { revalidate: 60 * 60 * 24 });

export default async function Homepage({ searchParams }: HomeProps) {
  try {

    const products = await getProducts(searchParams);

    if(products.length === 0){
      return<ProductGridSection
      title={`No Search Results found for "${searchParams.search}"`}
      productsFetcher={getMostNewestProducts}      
    />
    }

    // Determine if a search is being performed
    const isSearching = searchParams.search && searchParams.search.trim() !== "";
    const shuffledProducts = isSearching ? shuffleArray(products) : [];

    return (
      <main className="space-y-9">
        {isSearching && (
          <ProductGridSection
            title={`Search Results for "${searchParams.search}"`}
            productsFetcher={async () => shuffledProducts}
          />
        )}

        <ProductGridSection
          title="Most Popular"
          productsFetcher={getMostPopularProducts}
        />
        <ProductGridSection
          title="Newest Products"
          productsFetcher={getMostNewestProducts}
        />
      </main>
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return (
      <div className="w-full h-[50vh] flex items-center justify-center text-xl md:text-2xl">
        <p className="font-medium text-red-500">An error occurred while fetching products. Please try again later.</p>
      </div>
    );
  }
}

type ProductGridSectionProps = {
  title: string;
  productsFetcher: () => Promise<Product[]>;
};

function ProductGridSection({
  productsFetcher,
  title,
}: ProductGridSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Button variant="outline" asChild>
          <Link href="/products" className="flex items-center space-x-2">
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductSuspense productsFetcher={productsFetcher} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductSuspense({
  productsFetcher,
}: {
  productsFetcher: () => Promise<Product[]>;
}) {
  try {
    const products = await productsFetcher();
    return products.map((product) => (
      <ProductCard key={product.id} {...product} />
    ));
  } catch (error) {
    console.error('Error fetching product grid section:', error);
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        <p>Failed to load products.</p>
      </div>
    );
  }
}


