// src/app/api/products/updateProduct/route.ts

import { NextResponse } from 'next/server';
import { updateProduct } from '@/app/admin/_actions/products';
import { z } from 'zod';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Parse the form data
    const formData = await request.formData();

    // Invoke the centralized updateProduct action
    const updatedProduct = await updateProduct(formData);

    // Respond with success and the updated product
    return NextResponse.json({ message: 'Product updated successfully', product: updatedProduct }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating product:", error);

    // Determine the type of error and respond accordingly
    if (error instanceof z.ZodError) {
      // Handle Zod validation errors
      return NextResponse.json(
        { errors: error.flatten().fieldErrors },
        { status: 400 }
      );
    } else if (typeof error === 'object' && error !== null && 'errors' in error) {
      // Handle field-specific errors
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    } else if (error instanceof Error) {
      // Handle general errors
      return NextResponse.json(
        { errors: { general: [error.message] } },
        { status: 500 }
      );
    } else {
      // Handle unexpected errors
      return NextResponse.json(
        { errors: { general: ['An unexpected error occurred.'] } },
        { status: 500 }
      );
    }
  }
}
