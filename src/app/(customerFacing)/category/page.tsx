// src/app/categories/page.tsx

import { ProductGridSection } from '@/components/ProductsGridSection';
import { Category as PrismaCategory } from '@prisma/client';
import { getAllCategoriesWithProducts, getProductsByCategory } from '@/actions/categories';

export default async function CategoriesPage() {
    const categories: PrismaCategory[] = await getAllCategoriesWithProducts();

    console.log("Fetched Categories:", categories);

    return (
        <div className="container mx-auto px-4 py-8">
            {categories.map((category) => {
                if (!category.id) {
                    console.error(`Category with name ${category.name} is missing an ID.`);
                    return null; // Skip rendering this category
                }
                return (
                    <div key={category.id} className="w-full max-w-[750px] mb-8">
                        <ProductGridSection
                            title={category.name}
                            productsFetcher={() => getProductsByCategory(category.id)}
                            layout="flex"
                            categoryId={category.id}
                        />
                    </div>
                );
            })}
        </div>
    );
}
