// components/ClientLayout.tsx

"use client";

import { Nav, NavLink } from "@/components/Nav";
import { UserSignOut, UserSignIn } from "@/components/UserAccountNav";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import CartCounter from "../../components/CartCounter";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearhBar"; // Corrected typo from "SearhBar" to "SearchBar"
import { ShoppingBag, Store, User } from "lucide-react";
import {BurgerMenu }from "@/components/BurgerMenu"; // Assuming BurgerMenu is correctly imported

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { data: session, status } = useSession();
  const [isProfileClicked, setIsProfileClicked] = useState<boolean>(false);

  // Create a ref for the profile menu
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLAnchorElement>(null);

  const router = useRouter();

  // Handle clicks outside of the profile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close the menu if clicking outside the profile menu and profile button
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileClicked(false);
      }
    };

    // Add event listener when the profile menu is open
    if (isProfileClicked) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener when component unmounts or menu is closed
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileClicked]);

  // Optional: Handle authentication status if needed
  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session) {
      // Optional: Redirect to sign-in or show guest UI
      // signIn(); // Uncomment if you want to automatically trigger sign-in
    }
  }, [session, status]);

  return (
    <>
      <Nav className="fixed z-50">
        <NavLink href="/">
          <Store />
        </NavLink>
        <div className="flex justify-center mx-auto gap-5 items-center my-auto">
          <div className="hidden md:block">
            <SearchBar />
          </div>
        </div>
        <div className="inline-flex justify-center text-center align-center space-x-2">
          <div className="hidden md:flex items-center space-x-2">
            <a
              ref={profileButtonRef} // Reference the profile button
              href="#"
              className="flex text-white w-full text-nowrap pr-2"
              onClick={(e) => {
                e.preventDefault(); // Prevent default anchor behavior
                setIsProfileClicked((prev) => !prev); // Toggle visibility on click
              }}
            >
              <div className="w-8">
                <User />
              </div>
              Hello, {session?.user?.name || "Guest"}
            </a>
            {isProfileClicked && (
              <div
                ref={profileMenuRef}
                className="absolute top-[3.5rem] right-[4.5rem] bg-white p-2 shadow-lg rounded-lg"
              >
                {session?.user ? (
                  <div className="space-y-2 mt-5">
                    <NavLink
                      href={`/user`}
                      className="h-10 flex items-center justify-center rounded-lg bg-primary text-white text-nowrap px-4 focus:bg-white focus:text-black transition-colors duration-200"
                    >
                      My Account
                      <div className="px-2">
                        {/* User icon */}
                        <User />
                      </div>
                    </NavLink>

                    {/* Conditionally render Admin Dashboard link */}
                    {session.user.role === Role.ADMIN && (
                      <NavLink
                        href="/admin"
                        className="h-10 flex items-center justify-center rounded-lg bg-primary text-white text-nowrap px-4 focus:bg-white focus:text-black transition-colors duration-200"
                      >
                        Admin Dashboard
                        <div className="px-2">
                          {/* Admin icon */}
                          <ShoppingBag />
                        </div>
                      </NavLink>
                    )}

                    <UserSignOut />
                  </div>
                ) : (
                  <UserSignIn />
                )}
              </div>
            )}
          </div>

          {/* Pass session data to the BurgerMenu */}
          <BurgerMenu session={session} />
          <NavLink href="/cart">
            <CartCounter />
          </NavLink>
        </div>
      </Nav>

      <div className="container mb-4 mt-24">{children}</div>
    </>
  );
}
