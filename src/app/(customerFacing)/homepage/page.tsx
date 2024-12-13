// pages/index.tsx

import { Category as PrismaCategory } from '@prisma/client';
import {
  getAllCategoriesWithProducts,
  getMostNewestProducts,
  getProductsByCategory,
} from '@/actions/categories';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductSlider } from './_components/ProductsSlider';
import { ProductGridSection } from '@/components/ProductsGridSection';


export default async function Homepage() {
  try {
    const products = await getMostNewestProducts();
    const categories: PrismaCategory[] = await getAllCategoriesWithProducts();

    // Fetch products for all categories
    const categoriesWithProducts = await Promise.all(
      categories.map(async (category) => {
        const products = await getProductsByCategory(category.id);
        return { category, products };
      })
    );

    // Fetch "Our Newest Products"
    const newestProducts = await getMostNewestProducts();

    return (
      <>
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
          {categoriesWithProducts.map(({ category, products }) => (
            <div key={category.id} className="w-full max-w-[750px] mx-auto mb-8">
              <ProductGridSection
                title={category.name}
                products={products}
                layout="flex"
                categoryId={category.id}
                enableSliderOnMobile={true} // Enable slider for categories
              />
            </div>
          ))}
        </main>

        {/* "Our Newest Products" Section */}
        <div className="mt-12">
          <ProductGridSection
            title="Our Newest Products"
            products={newestProducts}
            layout="grid"
            enableSliderOnMobile={true}
            // Slider is not enabled here
          />
        </div>
      </>
    );
  } catch (error) {
    console.error('Error fetching products or categories:', error);
    return (
      <div className="w-full h-[50vh] flex items-center justify-center text-xl md:text-2xl">
        <p className="font-medium text-red-500">
          An error occurred while fetching products. Please try again later.
        </p>
      </div>
    );
  }
}
