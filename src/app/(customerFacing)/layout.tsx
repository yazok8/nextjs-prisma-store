import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth"; // Client-side layout component
import ClientLayout from "./ClientLayout";

async function fetchSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  return session;
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await fetchSession(); // Fetch session server-side

  return (
    <ClientLayout session={session}>
      {children}
    </ClientLayout>
  );
}
