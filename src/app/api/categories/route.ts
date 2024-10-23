import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Handle GET requests
export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle POST requests
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Category name is required and must be a string." },
        { status: 400 }
      );
    }

    const newCategory = await prisma.category.create({
      data: { name: name.trim() },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category:", error);
    // Prisma duplicate key error code
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Category must be unique" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
