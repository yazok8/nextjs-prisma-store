// src/actions/products.ts

import db from "@/db/db";
import { Product } from "@prisma/client";

export interface IProductParams {
  search?: string; // Ensure this matches the query parameter 'search'
}

export default async function getProducts(params: IProductParams): Promise<Product[]> {
  const { search } = params;

  const query: any = {
    where: { isAvailableForPurchase: true },
    orderBy: { name: "asc" },
  };

  if (search && search.trim() !== "") {
    query.where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  return await db.product.findMany(query);
}
