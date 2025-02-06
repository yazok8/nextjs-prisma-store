"use client";

import { SessionProvider } from "next-auth/react";
import { CartContextProvider } from "@/app/webhooks/useCart/CartContext";
import React, { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <CartContextProvider>
        {children}
      </CartContextProvider>
    </SessionProvider>
  );
}
