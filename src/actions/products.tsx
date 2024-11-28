// src/actions/products.ts

import { Product } from "@prisma/client";
import {prisma} from '@/lib/prisma';

export interface IProductParams {
  search?: string;
}

/**
 * Fetches products based on search parameters.
 * @param params - Search parameters including 'search'.
 * @returns Promise resolving to an array of products.
 */
export default async function getProducts(params: IProductParams): Promise<Product[]> {

  const query: any = {
    where: { isAvailableForPurchase: true },
    orderBy: { name: "asc" },
  };

  try {
    const fetchedProducts = await prisma.product.findMany(query);
    console.log('Products fetched from database:', fetchedProducts);
    return fetchedProducts;
  } catch (error) {
    console.error('Error fetching products from database:', error);
    throw error;
  }
}