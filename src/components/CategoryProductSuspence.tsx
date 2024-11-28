import React from "react";
import { ProductWithCategory } from "@/types/Category";
import { ProductCard } from "./ProductCard";

export async function CategoryProductSuspense({
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
                        <div key={product.id} className="w-[311px] sm:w-[280px] flex-shrink-0">
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