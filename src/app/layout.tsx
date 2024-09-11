import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import Provider from "@/components/Provider";
import CartProvider from "@/Providers/CartProvider";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"],variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Online Office Store",
  description: "Top quality office desks and chairs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <Provider>
        <CartProvider>
        <body>
      <main className={cn("min-h-screen bg-background font-sans antialiased",inter.variable)}>{children}</main>
      <Toaster />
      <Footer/>
      </body>
        </CartProvider>
      </Provider>
    </html>
  );
}
