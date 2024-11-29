import { ProductGridSection } from '@/components/ProductsGridSection';
import { Category as PrismaCategory } from '@prisma/client';
import { getAllCategoriesWithProducts, getProductsByCategory } from '@/actions/categories';

export default async function CategoriesPage() {
  const categories: PrismaCategory[] = await getAllCategoriesWithProducts();

  console.log('Fetched Categories:', categories);

  // Fetch products for all categories
  const categoriesWithProducts = await Promise.all(
    categories.map(async (category) => {
      const products = await getProductsByCategory(category.id);
      return { category, products };
    })
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {categoriesWithProducts.map(({ category, products }) => {
        if (!category.id) {
          console.error(`Category with name ${category.name} is missing an ID.`);
          return null; // Skip rendering this category
        }
        return (
          <div key={category.id} className="w-full max-w-[750px] mb-8">
            <ProductGridSection
              title={category.name}
              products={products}
              layout="flex"
              categoryId={category.id}
              enableSliderOnMobile={true} // Set to true if needed
            />
          </div>
        );
      })}
    </div>
  );
}
