"use server";

import db from "@/db/db";
import { notFound, redirect } from "next/navigation";
import fs from "fs/promises";
import { File } from "buffer";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const fileSchema = z.instanceof(File, { message: "Required" });
const imageSchema = fileSchema.refine(file => file.size === 0 || file.type.startsWith("image/"));

const editSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1),
  address: z.string().min(1),
  image: imageSchema.optional(),
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
    await fs.writeFile(
      `public${profileImage}`,
      Buffer.from(await data.image.arrayBuffer())
    );
  }

  if(!data.address && !data.image){
    console.log("some user details are missing");
    
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

  revalidatePath("/")
  revalidatePath("/user")

  redirect("/user")
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
