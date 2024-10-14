"use server";

import db from "@/db/db";
import { z } from "zod";
import fs from "fs/promises";
import { File } from "buffer";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Define schemas using Zod
const fileSchema = z.instanceof(File, { message: "File is required." });

const imageSchema = fileSchema.refine(
  file => file.size === 0 || file.type.startsWith("image/"),
  { message: "File must be an image." }
);

// Schema for adding a product
const addSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  priceInCents: z.coerce.number().int().min(1, { message: "Price must be at least 1 cent." }),
  image: imageSchema.refine(file => file.size > 0, { message: "Image is required." }),
  categoryId: z.string().min(1, { message: "Category is required." }), // Added categoryId
});

// Schema for editing a product
const editSchema = addSchema.extend({
  image: imageSchema.optional(),
  categoryId: z.string().optional(), // Made categoryId optional for edits
});

// Function to add a new product
export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  // Verify that the category exists
  const categoryExists = await db.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!categoryExists) {
    return { categoryId: ["Selected category does not exist."] };
  }

  // Ensure directories exist
  await fs.mkdir("products", { recursive: true });
  await fs.mkdir("public/products", { recursive: true });

  // Generate a unique image path and save the image
  const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
  await fs.writeFile(
    `public${imagePath}`,
    Buffer.from(await data.image.arrayBuffer())
  );

  // Create the product in the database
  await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      imagePath,
      categoryId: data.categoryId, // Include categoryId
    },
  });

  // Revalidate relevant paths to update caches
  revalidatePath("/");
  revalidatePath("/products");

  // Redirect to the admin products page
  redirect("/admin/products");
}

// Function to update an existing product
export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;
  const product = await db.product.findUnique({ where: { id } });

  if (!product) return notFound();

  let imagePath = product.imagePath;
  if (data.image && data.image.size > 0) {
    // Delete the old image
    await fs.unlink(`public${product.imagePath}`);
    // Generate a new image path and save the new image
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    );
  }

  // If categoryId is provided, verify it exists
  if (data.categoryId) {
    const categoryExists = await db.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      return { categoryId: ["Selected category does not exist."] };
    }
  }

  // Update the product in the database
  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      imagePath,
      categoryId: data.categoryId ?? product.categoryId, // Update categoryId if provided
    },
  });

  // Revalidate relevant paths to update caches
  revalidatePath("/");
  revalidatePath("/products");

  // Redirect to the admin products page
  redirect("/admin/products");
}

// Function to toggle product availability
export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({
    where: { id },
    data: { isAvailableForPurchase },
  });

  revalidatePath("/");
  revalidatePath("/products");
}

// Function to delete a product
export async function deleteProduct(id: string) {
  const product = await db.product.delete({ where: { id } });

  if (!product) return notFound();

  // Delete the associated image
  await fs.unlink(`public${product.imagePath}`);

  revalidatePath("/");
  revalidatePath("/products");
}
