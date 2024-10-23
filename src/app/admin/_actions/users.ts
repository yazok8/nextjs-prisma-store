"use server"

import {prisma} from '@/lib/prisma';


export async function deleteUser(id: string) {
  try {
    const user = await prisma.user.delete({ where: { id } });
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
