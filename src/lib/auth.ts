import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import db from "@/db/db";
import { createHash } from "crypto";

// Function to hash a password using crypto
async function hashPassword(password: string): Promise<string> {
  return createHash("sha256").update(password).digest("hex");
}

export const authOptions: NextAuthOptions = {
  secret:process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/user/sign-in',  // Custom sign-in page
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john@gmail.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          return null;
        }

        const lowercasedEmail = credentials.email.toLowerCase();

        const existingUser = await db.user.findUnique({
          where: { email: lowercasedEmail },
        });

        if (!existingUser) {
          console.log("User not found");
          return null;
        }

        // Hash the input password
        const hashedInputPassword = await hashPassword(credentials.password);
        if (existingUser.hashedPassword === hashedInputPassword) {
          return {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
          };
        } else {
          console.log("Password mismatch");
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          name: user.name,
          email: user.email
        };
      }
      return token;
    },
    async session({ session, token }) {
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
