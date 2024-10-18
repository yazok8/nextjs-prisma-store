import { Role } from "@prisma/client";

import type { User } from "next-auth";

import 'next-auth/jwt'

type userId = string

declare module "next-auth/jwt"{
    interface JWT{
        id: string;
        name: string;
        email: string;
        profileImage?: string | null;
        role: Role;
    }
}

declare module 'next-auth'{
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string | null; // Mapped from profileImage
            role: Role;
          };
          expires: ISODateString;
    }
    interface User {
        id: string;
        name: string;
        email: string;
        profileImage?: string | null;
        role: Role;
      }
}