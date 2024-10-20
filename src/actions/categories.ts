// src/actions/categories.ts

import db from "@/db/db";
import { cache } from "@/lib/cache";
import { Category } from "@prisma/client";

// Fetch all active categories, ordered alphabetically
const getAllCategories = cache((): Promise<Category[]> => {
  return db.category.findMany({
        orderBy: {
            name: "asc",
          },
  });
}, ["/", "getAllCategories"], { revalidate: 60 * 60 * 24 }); // Cache for 24 hours

export default getAllCategories;
