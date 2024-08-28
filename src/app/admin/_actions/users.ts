"use server"

import db from "@/db/db";


export async function deleteUser(id: string) {
  try {
    const user = await db.user.delete({ where: { id } });
    if (!user) {
      console.error(`User with id ${id} not found`);
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.log(`Failed to delete user with id ${id}:`, error);
    throw new Error("Failed to delete user");
  }
}
