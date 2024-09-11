import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import db from "@/db/db";
import { createHash } from "crypto";

// Function to hash a password using SHA-256 and return the hexadecimal digest
async function hashPassword(password: string): Promise<string> {
  return createHash("sha256").update(password).digest("hex");
}

// Configuration options for NextAuth
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // Secret used to sign the JWT and hash cookies
  adapter: PrismaAdapter(db), // Use the Prisma adapter for managing users in the database
  session: {
    strategy: 'jwt', // Use JWT strategy for sessions (instead of database sessions)
  },
  pages: {
    signIn: '/user/sign-in',  // Custom sign-in page URL
  },
  providers: [
    // Credentials provider for email and password authentication
    CredentialsProvider({
      name: "Credentials", // Name of the provider
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john@gmail.com" }, 
        password: { label: "Password", type: "password" }, 
      },
      // Authorization function that validates the credentials
      async authorize(credentials) {
        // Check if both email and password are provided
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          return null;
        }

        // Convert email to lowercase for consistent lookup
        const lowercasedEmail = credentials.email.toLowerCase();

        // Find the user in the database by email
        const existingUser = await db.user.findUnique({
          where: { email: lowercasedEmail },
        });

        // If user is not found, return null
        if (!existingUser) {
          console.log("User not found");
          return null;
        }

        // Hash the input password to compare with the stored hashed password
        const hashedInputPassword = await hashPassword(credentials.password);
        if (existingUser.hashedPassword === hashedInputPassword) {
          // If passwords match, return the user object
          return {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
          };
        } else {
          // If passwords do not match, return null
          console.log("Password mismatch");
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Redirect callback to control where users are redirected after sign-in
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl; // Only allow redirects within the same origin
    },
    // JWT callback to include additional information in the token
    async jwt({ token, user }) {
      if (user) {
        // If the user object is available (on sign-in), merge user data into the token
        return {
          ...token,
          name: user.name,
          email: user.email
        };
      }
      return token; // Return the existing token if no user data is available
    },
    // Session callback to include additional information in the session object
    async session({ session, token }) {
      // Merge user data from the token into the session object
      return {
        ...session,
        user: {
          ...session.user,
          name: token.name,
          email: token.email
        }
      };
    }
  }
};