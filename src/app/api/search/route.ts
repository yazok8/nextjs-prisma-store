import { NextRequest, NextResponse } from "next/server";
import { prisma }from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json([]);
    }

    const [categories, products] = await Promise.all([
      // Search categories
      prisma.category.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
        },
      }),

      // Search products
      prisma.product.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true
        },
      }),
    ]);

    // Combine and format results
    const formattedResults = [
      ...categories.map((category) => ({
        ...category,
        type: "category" as const,
      })),
      ...products.map((product) => ({
        ...product,
        type: "product" as const,
      })),
    ];

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}