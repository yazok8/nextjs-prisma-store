// src/app/api/products/addProduct/route.ts

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

// Zod Schemas for Validation
const addSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  priceInCents: z.coerce.number().int().min(1, { message: "Price must be at least 1 cent." }),
  categoryId: z.string().min(1, { message: "Category is required." }),
});

// Define UploadedFile interface
interface UploadedFile {
  filepath: string;
  mimetype: string;
  originalFilename: string | null;
}

// Helper function to convert Blob to Buffer
async function blobToBuffer(blob: Blob): Promise<Buffer> {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Handle POST requests
export async function POST(request: Request) {
  try {
    // Ensure the request has a body
    if (!request.body) {
      return NextResponse.json(
        { errors: { general: ["No request body found."] } },
        { status: 400 }
      );
    }

    // Parse the form data
    const formData = await request.formData();

    // Extract form fields
    const name = formData.get('name');
    const description = formData.get('description');
    const priceInCents = formData.get('priceInCents');
    const categoryId = formData.get('categoryId');
    const image = formData.get('image');

    // Validate presence of required fields
    if (!name || !description || !priceInCents || !categoryId || !image) {
      return NextResponse.json(
        { errors: { general: ["All fields are required."] } },
        { status: 400 }
      );
    }

    // Validate form data using Zod
    const result = addSchema.safeParse({
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

    // Ensure the image is a Blob
    if (!(image instanceof Blob)) {
      return NextResponse.json(
        { errors: { image: ["Image is required and must be a file."] } },
        { status: 400 }
      );
    }

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
    // Since Blob does not have a 'name' property, handle filename accordingly
    // Assuming the client sends the filename as part of the form data or another method
    // If not, default to a generic name with extension
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

    // Create the product in the database
    await prisma.product.create({
      data: {
        isAvailableForPurchase: false,
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        imagePath: key,
        categoryId: data.categoryId,
      },
    });

    // Respond with success
    return NextResponse.json({ message: 'Product added successfully' }, { status: 200 });
  } catch (error: any) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { errors: { general: ["An error occurred while adding the product."] } },
      { status: 500 }
    );
  }
}
