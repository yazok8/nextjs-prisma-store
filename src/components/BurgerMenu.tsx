"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { UserSignOut, UserSignIn } from "@/components/UserAccountNav";
import burgerMenu from "../../public/burgerMenu.svg";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Nav, NavLink } from "./Nav";

type BurgerMenuProps = {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    } | null;
  } | null;
};

export function BurgerMenu({ session }: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false); // Local state to control whether the menu is open or closed.

  

    // Create a ref for the burger menu
    const burgerMenuRef= useRef<HTMLDivElement>(null)

    // Handle clicks outside of the burger menu
    useEffect(()=>{
      const handleClickOutside = ()=>{
        if(burgerMenuRef.current && !burgerMenuRef.current.contains(event?.target as Node)){
          // Close the burger menu
          setIsOpen(false)
        }
      }
      
      // Add event listener when the bruger menu is open
      if(isOpen){
        document.addEventListener("mousedown", handleClickOutside)
      }else{
        document.removeEventListener("mousedown", handleClickOutside)
      }

       // Cleanup the event listener when component unmounts or menu is closed
      return ()=>{
        document.removeEventListener("mousedown", handleClickOutside)
      };
    }, [isOpen]
  )
  

  return (
    <div ref={burgerMenuRef} className="relative md:hidden flex items-center space-x-2">
      {/* Button to toggle the burger menu. It's hidden on medium and larger screens (md:hidden). */}
      <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
        <Image src={burgerMenu} width={50} height={50} alt="burger menu" />
      </button>

      {/* Render the dropdown menu if isOpen is true */}
      {isOpen && (
        <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-lg shadow-xl z-30 block">
          {/* If the user is logged in, display user info and sign-out option */}
          {session?.user ? (
            <>
            
              <div className="px-4 py-2 space-y-2">
                <p className="text-black">Hello, {session?.user?.name}</p>

                {/* Button to navigate to the user's account page */}
                <NavLink
                    href={`/user`}
                    className="h-4 flex my-auto justify-center items-center rounded-lg bg-primary text-white text-nowrap px-auto focus:bg-white focus:text-black"
                  >
                    My Account
                    <div className="px-2">
                      {/* User icon */}
                      <User />
                    </div>
                  </NavLink>

                {/* Sign-out button */}
                <div className="flex flex-col space-y-2">
                <NavLink className=" h-4 flex my-auto justify-center items-center rounded-lg bg-primary text-white focus:bg-white focus:text-black" href="/products">Products</NavLink>
                <NavLink className=" h-4 flex my-auto justify-center items-center rounded-lg bg-primary text-white focus:bg-white focus:text-black" href="/orders">My Orders</NavLink>
                </div>
                
                <UserSignOut />
              </div>
            </>
          ) : (
            // If the user is not logged in, display the sign-in option
            <div className="px-4 py-2">
              <UserSignIn />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
