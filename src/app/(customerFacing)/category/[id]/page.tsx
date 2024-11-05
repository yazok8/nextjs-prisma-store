// src/app/category/[id]/page.tsx

import { getProductsByCategoryPaginated, getCategoryById } from '@/actions/categories';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

type Props = {
    params: {
        id: string;
    };
    searchParams: {
        page?: string;
    };
};

const PRODUCTS_PER_PAGE = 6;

export default async function CategoryPage({ params, searchParams }: Props) {
    const { id } = params;
    const page = parseInt(searchParams.page || '1', 10);

    // Fetch category details
    const category = await getCategoryById(id);
    if (!category) {
        return <div className="text-red-500">Category not found.</div>;
    }

    // Fetch paginated products
    const { products, total } = await getProductsByCategoryPaginated(id, page, PRODUCTS_PER_PAGE);

    const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col">
            {/* Content Wrapper */}
            <div>
                {/* Category Title */}
                <h1 className="text-3xl font-bold">{category.name}</h1>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center items-center space-x-2">
                    {page > 1 && (
                        <Link href={`/category/${id}?page=${page - 1}`}>
                            <Button variant="outline">Previous</Button>
                        </Link>
                    )}
                    {page < totalPages && (
                        <Link href={`/category/${id}?page=${page + 1}`}>
                            <Button variant="outline">Next</Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Page Info */}
            <div className="mt-auto text-center py-4">
                <span>
                    Page {page} of {totalPages}
                </span>
            </div>
        </div>
    );
}
