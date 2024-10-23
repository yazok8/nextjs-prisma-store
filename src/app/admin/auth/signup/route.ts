import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import {prisma} from '@/lib/prisma';


// Define a schema for user data validation using zod
const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  hashedPassword: z.string().min(1, 'Password is required').min(8, 'Password must have minimum 8 characters'),
});

// Function to hash a password using crypto
async function hashPassword(password: string): Promise<string> {
  return createHash('sha256').update(password).digest('hex');
}

export async function POST(req: Request) {
  try {
    // Parse and validate the incoming request body using the userSchema
    const body = await req.json();
    const { name, email, hashedPassword } = userSchema.parse(body);

    // Check if email already exists
    const emailExists = await prisma.user.findUnique({ where: { email: email } });
    if (emailExists) {
      // If the email is already in use, return a conflict status with an error message
      return NextResponse.json({ user: null, message: "User with this email already exists" }, { status: 409 });
    }

    // Hash the user-provided password
    const hashedPasswordFromRequest = await hashPassword(hashedPassword);

    const lowercasedEmail = email.toLowerCase();

    // Create a new user record in the database with the provided data
    const newUser = await prisma.user.create({
      data: {
        name,
        email:lowercasedEmail,
        hashedPassword: hashedPasswordFromRequest,
      }
    });

    // Exclude the hashed password from the response to avoid exposing it
    const { hashedPassword: newUserPassword, ...rest } = newUser;
    
    // Return a success response with the new user's data (excluding the password)
    return NextResponse.json({ user: rest, message: "User created successfully " }, { status: 201 });

  } catch (err) {
    // If any error occurs, return an internal server error status with a generic error message
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
