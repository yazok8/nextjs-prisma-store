"use client";

import { Session } from "next-auth";
import { BurgerMenu } from "@/components/BurgerMenu";
import { Nav, NavLink } from "@/components/Nav";
import { UserSignOut, UserSignIn } from "@/components/UserAccountNav";
import { ShoppingBag, User } from "lucide-react";
import { useState } from "react";

interface ClientLayoutProps {
  session: Session | null;
  children: React.ReactNode;
}

export default function ClientLayout({ session, children }: ClientLayoutProps) {
  const [isProfileClicked, setIsProfileClicked] = useState(false);

  return (
    <>
      <Nav>
        <div className="flex justify-center mx-auto">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/products">Products</NavLink>
          <NavLink href="/orders">My Orders</NavLink>
        </div>
        <div className="hidden md:flex items-center absolute top-3 right-10 space-x-2">
          <a
            href="#"
            className="flex text-white w-full text-nowrap pr-2"
            onClick={() => setIsProfileClicked((prev) => !prev)} // Toggle visibility on click
          >
            <div className="w-8">
              <User />
            </div>
            Hello, {session?.user?.name || 'Guest'}
          </a>
          {isProfileClicked && (
            <div className="absolute top-10 right-0 bg-white p-2 shadow-lg">
              {session?.user ? (
                <UserSignOut />
              ) : (
                <UserSignIn />
              )}
            </div>
          )}
        </div>

        {/* Pass session data to the BurgerMenu */}
        <BurgerMenu session={session} />
      </Nav>

      <div className="container my-4">{children}</div>
    </>
  );
}
