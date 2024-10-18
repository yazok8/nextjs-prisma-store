// src/app/api/auth/signup/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import db from '@/db/db'; // Adjust the path as necessary

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if the user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    // Hash the password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        hashedPassword,
        role: 'USER', // Default role
      },
    });

    return NextResponse.json(
      { message: 'User created successfully', user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during user sign-up:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
