// src/lib/auth.ts

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import db from '@/db/db'; // Adjust the path as necessary
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'john@gmail.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) {
          console.log("Missing credentials");
          return null;
        }

        // Type Assertion to inform TypeScript about credentials structure
        const { email, password } = credentials as { email: string; password: string };

        console.log(`Attempting to authenticate user with email: ${email}`);

        if (!email || !password) {
          console.log('Missing email or password');
          return null;
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase();

        // Find the user by email
        const user = await db.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user) {
          console.log('User not found for email:', email);
          return null;
        }

        // Compare password with hashed password using bcrypt
        const isValid = await bcrypt.compare(password, user.hashedPassword);

        if (!isValid) {
          console.log('Invalid password for email:', email);
          return null;
        }

        console.log('User authenticated successfully');

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          role: token.role,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/user/sign-in',
  },
};
