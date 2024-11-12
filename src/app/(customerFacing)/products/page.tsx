export const dynamic = 'force-dynamic';


import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import {prisma} from '@/lib/prisma';
import { cache } from "@/lib/cache";
import { ProductWithCategory } from "@/types/Category";
import { Suspense } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type ProductsPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

// Function to get products from the database, with caching applied
const getProducts = cache((page: number, perPage: number = 9) => {
  return prisma.product.findMany({
    where: { isAvailableForPurchase: true }, // Only fetch products that are available for purchase
    orderBy: { name: "asc" }, // Order the products alphabetically by name
    include:{category:true},
    skip: (page - 1) * perPage,
    take: perPage,
  });
}, ["/products", "getProducts"]); // Cache key based on the products path and function name

const getTotalProducts = async () => {
  return await prisma.product.count({
    where: { isAvailableForPurchase: true },
  });
};

// Main component for the displaying all the Products page
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const pageParam = searchParams.page;
  const page = Array.isArray(pageParam)
    ? parseInt(pageParam[0], 10)
    : parseInt(pageParam || "1", 10);

  const perPage = 9;

  const totalProducts = await getTotalProducts();
  console.log('Total Products:', totalProducts); 
  const totalPages = Math.ceil(totalProducts / perPage);

  return (
    <div className="flex flex-col items-center">
      {/* Grid layout for displaying products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Use Suspense to handle loading states */}
        <Suspense
          fallback={
            <>
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </>
          }
        >
          <ProductSuspense page={page} perPage={perPage} />
        </Suspense>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center space-x-4 mt-6">
        {page > 1 && (
          <Link href={`/products?page=${page - 1}`}>
            <Button variant="outline">Previous</Button>
          </Link>
        )}
        <span>
          Page {page} of {totalPages}
        </span>
        {page < totalPages && (
          <Link href={`/products?page=${page + 1}`}>
            <Button variant="outline">Next</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

async function ProductSuspense({ page, perPage }: { page: number; perPage: number }) {
  const products: ProductWithCategory[] = await getProducts(page, perPage);
  return products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}