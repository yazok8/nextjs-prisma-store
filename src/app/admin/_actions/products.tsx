"use server";

import {prisma} from '@/lib/prisma';
import { z } from "zod";
import fs from "fs/promises";
import { File } from "buffer";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const fileSchema = z.instanceof(File, { message: "File is required." });

const imageSchema = fileSchema.refine(
  file => file.size > 0 && file.type.startsWith("image/"),
  { message: "Valid image is required." }
);

// Schema for adding a product
const addSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  priceInCents: z.coerce.number().int().min(1, { message: "Price must be at least 1 cent." }),
  image: imageSchema,
  categoryId: z.string().min(1, { message: "Category is required." }),
});

// Initialize S3 client
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  region: process.env.AWS_REGION as string,
});

// Function to upload image to S3
export async function uploadImageToS3(file: File): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const key = `products/${uuidv4()}.${fileExtension}`;

  // Debugging Logs
  console.log("Uploading to Bucket:", process.env.AWS_S3_BUCKET_NAME);
  console.log("Object Key:", key);

  if (!process.env.AWS_S3_BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME environment variable is not set.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME as string,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    ACL: "public-read", // Adjust based on your requirements
  };

  try {
    await s3.putObject(params).promise();
    console.log("Upload successful:", key);
    return key;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Could not upload image to S3. Please try again later.");
  }
}

// Function to add a new product
export async function addProduct(formData: FormData): Promise<void> {
  // Parse and validate formData using Zod schemas
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) {
    // Handle validation errors by throwing an exception
    throw new Error('Validation failed: ' + JSON.stringify(result.error.formErrors.fieldErrors));
  }

  const data = result.data;

  // Verify that the category exists
  const categoryExists = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!categoryExists) {
    throw new Error("Selected category does not exist.");
  }

  try {
    // Upload image to S3
    const imageKey = await uploadImageToS3(data.image);

    // Create the product in the database
    await prisma.product.create({
      data: {
        isAvailableForPurchase: false,
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        imagePath: imageKey, // Store the S3 object key
        categoryId: data.categoryId,
      },
    });

    // Revalidate relevant paths to update caches
    revalidatePath("/");
    revalidatePath("/products");

    // Redirect to the admin products page
    redirect("/admin/products");
  } catch (error) {
    console.error("Error adding product:", error);
    // Handle errors by throwing an exception
    throw new Error("An error occurred while adding the product.");
  }
}

// Function to update an existing product
export async function updateProduct(id: string, formData: FormData): Promise<void> {
  // Parse and validate formData using Zod schemas
  const editSchema = addSchema.extend({
    image: imageSchema.optional(),
    categoryId: z.string().min(1, { message: "Category is required." }).optional(),
  });

  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) {
    // Handle validation errors by throwing an exception
    throw new Error('Validation failed: ' + JSON.stringify(result.error.formErrors.fieldErrors));
  }

  const data = result.data;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw new Error("Product not found.");
  }

  let imageKey = product.imagePath;

  try {
    if (data.image && data.image.size > 0) {
      // Upload the new image to S3
      const newImageKey = await uploadImageToS3(data.image);

      // Delete the old image from S3
      const deleteParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME as string,
        Key: product.imagePath,
      };

      await s3.deleteObject(deleteParams).promise();

      // Update imageKey to the new image
      imageKey = newImageKey;
    }

    // If categoryId is provided, verify it exists
    if (data.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!categoryExists) {
        throw new Error("Selected category does not exist.");
      }
    }

    // Update the product in the database
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        imagePath: imageKey,
        categoryId: data.categoryId ?? product.categoryId,
      },
    });

    // Revalidate relevant paths to update caches
    revalidatePath("/");
    revalidatePath("/products");

    // Redirect to the admin products page
    redirect("/admin/products");
  } catch (error) {
    console.error("Error updating product:", error);
    // Handle errors by throwing an exception
    throw new Error("An error occurred while updating the product.");
  }
}


// Wrapper function to handle update with a specific ID
// src/app/admin/_actions/products.tsx

export async function handleUpdateProduct(formData: FormData): Promise<void> {
  const id = formData.get('id');
  if (typeof id !== 'string') {
    throw new Error('Invalid product ID');
  }
  await updateProduct(id, formData);
}

// Function to toggle product availability
export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await prisma.product.update({
    where: { id },
    data: { isAvailableForPurchase },
  });

  revalidatePath("/");
  revalidatePath("/products");
}

// Function to delete a product
export async function deleteProduct(id: string) {
  const product = await prisma.product.delete({ where: { id } });

  if (!product) return notFound();

  // Delete the associated image
  await fs.unlink(`public${product.imagePath}`);

  revalidatePath("/");
  revalidatePath("/products");
}
