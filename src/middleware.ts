// src/middleware.ts

import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Role } from '@prisma/client';

const secret = process.env.NEXTAUTH_SECRET;

// Define paths to protect
const protectedAdminPaths = ['/admin'];

// Define paths to exclude from protection
const excludedPaths = [
  '/admin/signin',
  '/admin/signup',
  '/api/auth/signin',
  '/api/auth/signup',
  '/api/auth/[...nextauth]',
  '/api/auth/callback/credentials',
  '/403', // Forbidden page
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the request is for a protected admin path
  const isProtectedAdminPath = protectedAdminPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Exclude specific paths from protection
  const isExcludedPath = excludedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtectedAdminPath && !isExcludedPath) {
    // Retrieve the token using NextAuth's getToken
    const token = await getToken({ req, secret });

    if (!token) {
      console.warn(`Unauthorized access attempt to ${pathname}`);
      // Redirect to the admin sign-in page
      const signInUrl = new URL('/admin/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Check if the user has the 'ADMIN' role
    if (token.role !== Role.ADMIN) {
      console.warn(`Forbidden access attempt to ${pathname} by user ID: ${token.id}`);
      // Redirect to a 403 Forbidden page
      return NextResponse.redirect(new URL('/403', req.url));
    }

    console.log(`Authorized admin access to ${pathname} by user ID: ${token.id}`);
  }

  // Allow the request to proceed if not a protected admin path
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'], // Protect all routes under /admin
};
