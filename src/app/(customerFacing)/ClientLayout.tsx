"use client";

import { Session } from "next-auth";
import { BurgerMenu } from "@/components/BurgerMenu";
import { Nav, NavLink } from "@/components/Nav";
import { UserSignOut, UserSignIn } from "@/components/UserAccountNav";
import { ShoppingBag, Store, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ClientLayoutProps {
  session: Session | null;
  children: React.ReactNode;
}

export default function ClientLayout({ session, children }: ClientLayoutProps) {
  const [isProfileClicked, setIsProfileClicked] = useState(false);

  

  // Create a ref for the burger menu
  const profileMenuRef= useRef<HTMLDivElement>(null)

  // Handle clicks outside of the burger menu
  useEffect(()=>{
    const handleClickOutside = ()=>{
      if(profileMenuRef.current && !profileMenuRef.current.contains(event?.target as Node)){
        // Close the burger menu
        setIsProfileClicked(false)
      }
    }
    
    // Add event listener when the bruger menu is open
    if(isProfileClicked){
      document.addEventListener("mousedown", handleClickOutside)
    }else{
      document.removeEventListener("mousedown", handleClickOutside)
    }

     // Cleanup the event listener when component unmounts or menu is closed
    return ()=>{
      document.removeEventListener("mousedown", handleClickOutside)
    };
  }, [isProfileClicked]
)


  return (
    <>
      <Nav className="fixed">
      <NavLink href="/"><Store/></NavLink>
        <div className="flex justify-center mx-auto">
          <NavLink className="hidden md:flex" href="/products">Products</NavLink>
          <NavLink className="hidden md:flex" href="/orders">My Orders</NavLink>
        </div>
        <div className="inline-flex justify-center text-center align-center space-x-2">
          <div className="hidden md:flex items-center space-x-2">
            <a
              href="#"
              className="flex text-white w-full text-nowrap pr-2"
              onClick={() => setIsProfileClicked((prev) => !prev)} // Toggle visibility on click
            >
              <div className="w-8">
                <User />
              </div>
              Hello, {session?.user?.name || "Guest"}
            </a>
            {isProfileClicked && (
              <div ref={profileMenuRef} className="absolute top-[3.5rem] right-[4.5rem] bg-white p-2 shadow-lg">
                {session?.user ? <UserSignOut /> : <UserSignIn />}
              </div>
            )}
          </div>

          {/* Pass session data to the BurgerMenu */}
          <BurgerMenu session={session} />
          <NavLink href="/cart"><ShoppingBag className="my-auto" /></NavLink>
        </div>
      </Nav>

      <div className="container mb-4 mt-24">{children}</div>
    </>
  );
}
