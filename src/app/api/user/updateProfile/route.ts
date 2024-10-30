// src/app/api/user-profile/updateProfile/route.ts

import { NextResponse } from "next/server";
import { z } from "zod";
import { updateUser } from "@/app/(customerFacing)/_actions/user";

export async function POST(request: Request) {
  try {
    // Extract the 'id' from the query parameters
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { errors: { general: ["User ID is required."] } },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    // Add the 'id' to formData to be used by updateUser
    formData.append('id', id);

    // Invoke the centralized updateUser action
    const updatedUser = await updateUser(formData);

    return NextResponse.json(
      { message: 'User updated successfully', user: updatedUser },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user:", error);

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
