import { Category as PrismaCategory } from "@prisma/client";
import dynamic from 'next/dynamic'
import { getAllCategoriesWithProducts,getMostNewestProducts, getProductsByCategory  } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductGridSection } from "@/components/ProductsGridSection";


const HomepageSlider = dynamic(() => import('@/app/(customerFacing)/homepage/_components/HomepageSlider'));

export default async function Homepage() {

  try{
    const products = await getMostNewestProducts();

    // Fetch all categories that have at least one available product
    const categories: PrismaCategory[] = await getAllCategoriesWithProducts();




  return (
    <>
    <HomepageSlider products={products} />
    <main className="grid grid-cols-1 lg:grid-cols-2 gap-6 justify-center">
      {/* "View All Products" Button */}
      <div className="col-span-1 lg:col-span-2 flex justify-end mt-20">
        <Button variant="outline" asChild>
          <Link href="/products" className="flex items-center space-x-2">
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {/* Dynamically render ProductGridSection for each category */}
      {categories.map((category) => (
        <div key={category.id} className="w-full max-w-[750px]">
          <ProductGridSection
            title={category.name}
            productsFetcher={() => getProductsByCategory(category.id)}
            layout="flex" // Use flex layout for categories
            categoryId={category.id}
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
  )
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
