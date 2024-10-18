// src/app/admin/layout.tsx

import { Nav, NavLink } from "@/components/Nav";
import { AdminSignIn, AdminSignOut } from "@/components/AdminAccountNav";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/admin/dashboard");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/403");
  }

  return (
    <>
      <Nav className="flex justify-center">
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/products">Products</NavLink>
        <NavLink href="/admin/users">Customers</NavLink>
        <NavLink href="/admin/orders">Sales</NavLink>
        <NavLink href="/admin/discountCodes">Coupons</NavLink>
        <NavLink href="/">User Interface</NavLink>
        <div className="flex justify-end ml-auto">
          {session.user ? (
            <div className="my-auto flex items-center">
              {session.user.role === Role.ADMIN && <AdminSignOut />}
            </div>
          ) : (
            <AdminSignIn />
          )}
        </div>
      </Nav>

      <div className="container mt-20 mb-5">{children}</div>
    </>
  );
}
