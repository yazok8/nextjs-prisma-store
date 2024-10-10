import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import Provider from "@/components/Provider";
import { CartContextProvider } from "@/app/webhooks/useCart"; 
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
      <body className={cn("min-h-screen flex flex-col bg-background font-sans antialiased", inter.variable)}>
        <Provider>
          <CartContextProvider>
            <main className="flex-grow">{children}</main>
            <Toaster />
            <Footer />
          </CartContextProvider>
        </Provider>
      </body>
    </html>
  );
}
