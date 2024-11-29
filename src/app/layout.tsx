import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils"; 
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Provider"; // Import the new Providers component
import Footer from "@/components/footer/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Online electronics Store",
  description: "Top quality electronics products for your home and office",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen flex flex-col bg-background font-sans antialiased", inter.variable)} suppressHydrationWarning>
        <Providers>
          <main className="flex-grow">{children}</main>
          <Toaster />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
