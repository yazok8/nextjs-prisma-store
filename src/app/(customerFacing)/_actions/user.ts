// src/app/(customerFacing)/_actions/user.ts

"use server";

import { notFound } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { S3 } from "aws-sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Custom Validation Error Class
class ValidationError extends Error {
  constructor(public errors: Record<string, string[]>) {
    super("Validation Error");
  }
}

const imageSchema = z
  .instanceof(Blob)
  .refine((file) => file.size === 0 || file.type.startsWith("image/"), {
    message: "Only image files are allowed.",
  })
  .optional();

const editSchema = z.object({
  id: z.string().min(1, { message: "User ID is required." }), // Corrected message
  name: z.string().min(1, { message: "Name is required." }),
  email: z
    .string()
    .min(1, { message: "Email is required." })
    .email({ message: "Invalid email format." }),
  address: z.string().min(1, { message: "Address is required." }),
  image: imageSchema,
});

// Initialize S3 client
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  region: process.env.AWS_REGION as string,
});

// Helper function to convert Blob to Buffer
export async function blobToBuffer(blob: Blob): Promise<Buffer> {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function updateUser(formData: FormData) {
  // Extract and validate form data
  const dataObj = Object.fromEntries(formData.entries());

  const result = editSchema.safeParse({
    id: String(dataObj.id),
    name: String(dataObj.name),
    email: String(dataObj.email),
    address: String(dataObj.address),
    image: formData.get("image"),
  });

  if (!result.success) {
    throw new ValidationError(result.error.flatten().fieldErrors); // Throw structured errors
  }

  const { id, name, email, address, image } = result.data;

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) return notFound();

  let imagePath: string | undefined = undefined;

  if (image && image.size > 0 && image instanceof Blob) {
    // Read the file as a Buffer
    const imageBuffer = await blobToBuffer(image);

    // Enforce file size limit (10 MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (imageBuffer.length > MAX_SIZE) {
      throw new ValidationError({
        image: ["Image size should not exceed 10 MB."],
      });
    }

    // Generate a unique filename
    const originalFilename = (image as any).name || "uploaded-image";
    const fileExtension = path.extname(originalFilename) || ".jpg"; // Default to .jpg if no extension
    const key = `users-images/${uuidv4()}${fileExtension}`;

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
    if (user.profileImage) {
      try {
        await s3
          .deleteObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: user.profileImage,
          })
          .promise();
      } catch (error) {
        console.error("Error deleting old image from S3:", error);
        // Decide whether to throw an error or continue
      }
    }
  }

  // Log if some user details are missing
  if (!address && !image) {
    console.log("Some user details are missing");
  }

  // Update the user in the database
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      address,
      ...(imagePath && { profileImage: imagePath }), // Update profileImage only if a new image was uploaded
    },
  });

  // Revalidate paths to update cached data
  revalidatePath("/");
  revalidatePath("/user");

  // Remove redirect; handled by the client based on API response
  // redirect("/user");

  return updatedUser; // Return the updated user data
}

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return null;
    }
    const currentUser = await prisma.user.findUnique({
      where: {
        email: session?.user?.email,
      },
    });
    if (!currentUser) {
      return null;
    }
    return {
      ...currentUser,
      createdAT: currentUser.createdAt.toISOString(),
      updatedAt: currentUser.updatedAt.toISOString(),
      emailVerified: currentUser.emailVerified?.toISOString() || null,
    };
  } catch (error: any) {
    return null;
  }
}