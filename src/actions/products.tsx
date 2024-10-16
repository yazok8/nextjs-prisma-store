// src/actions/products.ts

import db from "@/db/db";
import { Product } from "@prisma/client";

export interface IProductParams {
  search?: string;
}

/**
 * Fetches products based on search parameters.
 * @param params - Search parameters including 'search'.
 * @returns Promise resolving to an array of products.
 */
export default async function getProducts(params: IProductParams): Promise<Product[]> {
  const { search } = params;

  const query: any = {
    where: { isAvailableForPurchase: true },
    orderBy: { name: "asc" },
  };

  if (search && search.trim() !== "") {
    query.where.name = {
      contains: search.trim(),
      mode: "insensitive",
    };
  }

  try {
    const fetchedProducts = await db.product.findMany(query);
    console.log('Products fetched from database:', fetchedProducts);
    return fetchedProducts;
  } catch (error) {
    console.error('Error fetching products from database:', error);
    throw error;
  }
}
