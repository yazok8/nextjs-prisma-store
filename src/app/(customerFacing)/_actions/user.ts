"use server";

import db from "@/db/db";
import { notFound, redirect } from "next/navigation";
import fs from "fs/promises";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const imageSchema = z
  .custom<File>((file) => file instanceof File && (file.size === 0 || file.type.startsWith("image/")), {
    message: "Required",
  })
  .optional();

const editSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1),
  address: z.string().min(1),
  image: imageSchema,
});

export async function updateUser(id: string, prevState: unknown, formData: FormData) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!result.success) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;
  const user = await db.user.findUnique({ where: { id } });

  if (!user) return notFound();

  let profileImage = user.profileImage;

  if (data.image && data.image.size > 0) {
    if (profileImage) {
      // Only attempt to unlink if profileImage is not null
      try {
        await fs.unlink(`public${profileImage}`);
      } catch (error) {
        console.log(`Failed to delete old profile image: ${error}`);
      }
    }

    profileImage = `/user/${crypto.randomUUID()}-${data.image.name}`;

    // Convert ArrayBuffer to Uint8Array and write the file
    const arrayBuffer = await data.image.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    await fs.writeFile(`public${profileImage}`, uint8Array);
  }

  if (!data.address && !data.image) {
    console.log("Some user details are missing");
  }

  await db.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      address: data.address,
      profileImage,
    },
  });

  revalidatePath("/");
  revalidatePath("/user");

  redirect("/user");
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
    const currentUser = await db.user.findUnique({
      where: {
        email: session?.user?.email,
      },
    });
    if(!currentUser){
        return null
    }
    return {
        ...currentUser, 
        createdAT:currentUser.createdAt.toISOString(), 
        updatedAt:currentUser.updatedAt.toISOString(), 
        emailVerified:currentUser.emailVerified?.toISOString() || null,
    }
  } catch (error: any) {
    return null;
  }
}
