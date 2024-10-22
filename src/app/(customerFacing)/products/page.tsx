import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import db from "@/db/db";
import { cache } from "@/lib/cache";
import { ProductWithCategory } from "@/types/Category";
import { Suspense } from "react";

// Function to get products from the database, with caching applied
const getProducts = cache(() => {
  return db.product.findMany({
    where: { isAvailableForPurchase: true }, // Only fetch products that are available for purchase
    orderBy: { name: "asc" }, // Order the products alphabetically by name
    include:{category:true}
  });
}, ["/products", "getProducts"]); // Cache key based on the products path and function name

// Main component for the Products page
export default function ProductsPage() {
  return (
    // Grid layout for displaying products
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Use Suspense to handle loading states */}
      <Suspense
        fallback={
          // Fallback UI to show while the products are being fetched (loading state)
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
        <ProductSuspense /> {/* Render the component that fetches and displays products */}
      </Suspense>
    </div>
  );
}

// Component to fetch products and render them within the Suspense boundary
async function ProductSuspense() {
  const products:ProductWithCategory[] = await getProducts(); // Fetch products using the cached function
  return products.map((product) => (
    <ProductCard key={product.id} {...product} />
  ));
}