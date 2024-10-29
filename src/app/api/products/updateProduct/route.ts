// src/app/api/products/updateProduct/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Ensure the API route runs in Node.js runtime
export const runtime = 'nodejs';

// Initialize S3
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  region: process.env.AWS_REGION as string,
});

// Zod Schema for Validation
const updateSchema = z.object({
  id: z.string().min(1, { message: "Product ID is required." }),
  name: z.string().min(1, { message: "Name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  priceInCents: z.coerce.number().int().min(1, { message: "Price must be at least 1 cent." }),
  categoryId: z.string().min(1, { message: "Category is required." }),
});

// Helper function to convert Blob to Buffer
async function blobToBuffer(blob: Blob): Promise<Buffer> {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Handle POST requests
export async function POST(request: Request) {
  try {
    // Parse the form data
    const formData = await request.formData();

    // Extract form fields
    const id = formData.get('id');
    const name = formData.get('name');
    const description = formData.get('description');
    const priceInCents = formData.get('priceInCents');
    const categoryId = formData.get('categoryId');
    const image = formData.get('image');

    // Validate presence of required fields (image is optional)
    if (!id || !name || !description || !priceInCents || !categoryId) {
      return NextResponse.json(
        { errors: { general: ["ID, name, description, price, and category are required."] } },
        { status: 400 }
      );
    }

    // Validate form data using Zod
    const result = updateSchema.safeParse({
      id: String(id),
      name: String(name),
      description: String(description),
      priceInCents: Number(priceInCents),
      categoryId: String(categoryId),
    });

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Verify that the category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { errors: { categoryId: ["Selected category does not exist."] } },
        { status: 400 }
      );
    }

    // Initialize imagePath (optional)
    let imagePath: string | undefined = undefined;

    // If image is provided, handle it
    if (image && image instanceof Blob && image.size > 0) {
      // Validate image file type
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          { errors: { image: ["Only image files are allowed."] } },
          { status: 400 }
        );
      }

      // Read the file as a Buffer
      const imageBuffer = await blobToBuffer(image);

      // Enforce file size limit (10 MB)
      const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
      if (imageBuffer.length > MAX_SIZE) {
        return NextResponse.json(
          { errors: { image: ["Image size should not exceed 10 MB."] } },
          { status: 400 }
        );
      }

      // Generate a unique filename
      const originalFilename = (image as any).name || 'uploaded-image';
      const fileExtension = path.extname(originalFilename) || '.jpg'; // Default to .jpg if no extension
      const key = `products/${uuidv4()}${fileExtension}`;

      // Ensure AWS_S3_BUCKET_NAME is set
      if (!process.env.AWS_S3_BUCKET_NAME) {
        throw new Error("AWS_S3_BUCKET_NAME environment variable is not set.");
      }

      // Upload image to S3
      const params: S3.PutObjectRequest = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: imageBuffer,
        ContentType: image.type,
      };

      await s3.upload(params).promise();

      imagePath = key;

      // Optional: Delete the old image from S3 if exists
      const existingProduct = await prisma.product.findUnique({
        where: { id: data.id },
        select: { imagePath: true },
      });

      if (existingProduct && existingProduct.imagePath) {
        try {
          await s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: existingProduct.imagePath,
          }).promise();
        } catch (error) {
          console.error("Error deleting old image from S3:", error);
          // Decide whether to throw an error or continue
        }
      }
    }

    // Update the product in the database
    const updatedProduct = await prisma.product.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        categoryId: data.categoryId,
        ...(imagePath && { imagePath }), // Update imagePath only if a new image was uploaded
      },
    });

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
