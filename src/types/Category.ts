// types/Category.ts
import { Product } from "@prisma/client";
import { Category as PrismaCategory } from "@prisma/client";

export type Category = PrismaCategory;
export interface ProductWithCategory extends Product {
  category: PrismaCategory | null;
}