import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils"; 
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/Provider"; // Import the new Providers component
import Footer from "@/components/footer/Footer";
import * as Sentry from "@sentry/nextjs";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Online Office Store",
  description: "Top quality office desks and chairs",
};

Sentry.init({
  dsn: process.env.SENTRY_DSN, // Set in environment variables
  tracesSampleRate: 1.0,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={cn("min-h-screen flex flex-col bg-background font-sans antialiased", inter.variable)}>
        <Providers>
          <main className="flex-grow">{children}</main>
          <Toaster />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
