"use server";

import {prisma} from '@/lib/prisma';
import { z } from "zod";
import fs from "fs/promises";
import { File } from "buffer";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import path from 'path';

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


// Zod Schema for Validation
const updateSchema = z.object({
  id: z.string().min(1, { message: "Product ID is required." }),
  name: z.string().min(1, { message: "Name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  priceInCents: z.coerce.number().int().min(1, { message: "Price must be at least 1 cent." }),
  categoryId: z.string().min(1, { message: "Category is required." }),
  brand:z.string().optional()
});


// Helper function to convert Blob to Buffer
export async function blobToBuffer(blob: Blob): Promise<Buffer> {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}


// Function to update an existing product
// Update Product Function
export async function updateProduct( formData: FormData) {
   // Extract form fields
   const id = formData.get('id');
   const name = formData.get('name');
   const description = formData.get('description');
   const priceInCents = formData.get('priceInCents');
   const categoryId = formData.get('categoryId');
   const brand = formData.get('brand');
   const image = formData.get('image');
 
   // Validate presence of required fields (image is optional)
   if (!id || !name || !description || !priceInCents || !categoryId) {
     throw { general: ["ID, name, description, price, and category are required."] };
   }
 
   // Validate form data using Zod
   const result = updateSchema.safeParse({
     id: String(id),
     name: String(name),
     description: String(description),
     priceInCents: Number(priceInCents),
     categoryId: String(categoryId),
     brand:String(brand)
   });
 
   if (!result.success) {
     const formattedErrors: Record<string, string[]> = result.error.flatten().fieldErrors;
     throw formattedErrors;
   }
 
   const data = result.data;
 
   // Verify that the category exists
   const categoryExists = await prisma.category.findUnique({
     where: { id: data.categoryId },
   });
 
   if (!categoryExists) {
     throw { categoryId: ["Selected category does not exist."] };
   }
 
   // Initialize imagePath (optional)
   let imagePath: string | undefined = undefined;
 
   // If image is provided, handle it
   if (image && image instanceof Blob && image.size > 0) {
     // Validate image file type
     if (!image.type.startsWith("image/")) {
       throw { image: ["Only image files are allowed."] };
     }
 
     // Read the file as a Buffer
     const imageBuffer = await blobToBuffer(image);
 
     // Enforce file size limit (10 MB)
     const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
     if (imageBuffer.length > MAX_SIZE) {
       throw { image: ["Image size should not exceed 10 MB."] };
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
       where: { id:data.id },
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
       brand: data.brand,
       ...(imagePath && { imagePath }), // Update imagePath only if a new image was uploaded
     },
   });
 
   return updatedProduct;
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
