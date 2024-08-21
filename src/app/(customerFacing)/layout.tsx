"use client";

import { Nav, NavLink } from "@/components/Nav";
import { User } from "lucide-react";

export const dynamic = "force-dynamic";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/products">Products</NavLink>
        <NavLink href="/orders">My Orders</NavLink>
      </Nav>
      {/* <Nav style={{position:"absolute", top:"0", right:"0", paddingInline:"0"}}>
          <NavLink href="/user/sign-in">
            <User />
          </NavLink>
        </Nav> */}

      <div className="container my-6">{children}</div>
    </>
  );
}
