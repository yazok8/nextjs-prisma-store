import { Nav, NavLink } from "@/components/Nav";
import { UserSignOut, UserSignIn } from "@/components/UserAccountNav";

import { authOptions } from "@/lib/auth";
import { User } from "@prisma/client";
import { ShoppingBag } from "lucide-react";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";

export default async function layout({
  children, user
}: Readonly<{
  children: React.ReactNode,user:User
}>) {
  const session = await getServerSession(authOptions);

  return (
    <>
      <Nav>
        <NavLink href="/products">Products</NavLink>
        <NavLink href="/orders">My Orders</NavLink>
      </Nav>
      <Nav
        style={{
          position: "absolute",
          top: "0",
          left: "1.25rem",
          paddingInline: "0",
        }}
      >
        <NavLink href="/">
          <ShoppingBag />
        </NavLink>
      </Nav>
      {session?.user ? (
        <>
          <a href={`/user`} className="absolute top-4 right-24 text-white">
            {session?.user?.name}
          </a>{" "}
          <UserSignOut />
        </>
      ) : (
        <div style={{ position: "absolute", right: 0, top: "0" }}>
          <UserSignIn />
        </div>
      )}
      <div className="container">{children}</div>
    </>
  );
}
