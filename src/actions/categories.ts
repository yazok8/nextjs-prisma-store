
import { Category, ProductWithCategory } from "@/types/Category";
import { cache } from "@/lib/cache";
import {prisma} from '@/lib/prisma';
import { Category as PrismaCategory } from "@prisma/client";

// Modified getAllCategories to fetch only categories with available products
export async function getAllCategoriesWithProducts(): Promise<Category[]> {
    return cache(
      (): Promise<Category[]> => {
        return prisma.category.findMany({
          where: {
            products: {
              some: {
                isAvailableForPurchase: true,
              },
            },
          },
          orderBy: {
            name: "asc",
          },
        });
      },
      ["/", "getAllCategoriesWithProducts"],
      { revalidate: 60 * 60 * 24 } // Cache for 24 hours
    )();
  }


 export const getMostNewestProducts = cache(
    (): Promise<ProductWithCategory[]> => {
      return prisma.product.findMany({
        where: { isAvailableForPurchase: true },
        orderBy: { createdAt: "desc" },
        include: { category: true },
        take: 6,
      });
    },
    ["/", "getMostNewestProducts"],
    { revalidate: 60 * 60 * 24 }
  );
  
  
  export const getProductsByCategory = cache(
    (categoryId: string): Promise<ProductWithCategory[]> => {
      return prisma.product.findMany({
        where: {
          isAvailableForPurchase: true,
          categoryId: categoryId,
        },
        include: {
          category: true,
        },
        take: 6,
      });
    },
    ["/", "getProductsByCategory"],
    { revalidate: 60 * 60 * 24 } // Cache for 24 hours
  );

  // Fetch paginated products by category
export async function getProductsByCategoryPaginated(
  categoryId: string,
  page: number,
  perPage: number
): Promise<{ products: ProductWithCategory[]; total: number }> {
  const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
          where: { categoryId },
          include: { category: true },
          skip: (page - 1) * perPage,
          take: perPage,
      }),
      prisma.product.count({
          where: { categoryId },
      }),
  ]);

  return { products, total };
}

// Fetch a single category by ID
export async function getCategoryById(id: string): Promise<PrismaCategory | null> {
  return prisma.category.findUnique({
      where: { id },
  });
}