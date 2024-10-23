// src/app/api/products/[id]/route.ts


import { NextRequest, NextResponse } from "next/server";
import {prisma} from '@/lib/prisma';


export async function GET(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: 'Product ID is required.' }, 
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }, // Include category details
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found.' }, 
        { status: 404 }
      );
    }

    // Transform the product data to simplify frontend consumption
    const updatedProduct = {
      id: product.id,
      imagePath: product.imagePath,
      name: product.name,
      priceInCents: product.priceInCents,
      description: product.description,
      category: product.category ? product.category.name : 'Uncategorized', // Extract category name
      // Add other fields as necessary
    };

    console.log(updatedProduct);

    return NextResponse.json(updatedProduct, { status: 200 });

  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error.' }, 
      { status: 500 }
    );
  }
}
