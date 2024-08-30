"use client";

import { useState } from "react";
import Image from "next/image";
import { UserSignOut, UserSignIn } from "@/components/UserAccountNav";
import burgerMenu from "../../public/burgerMenu.svg";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState<boolean>(false);

  console.log("BurgerMenu session:", session); // Debugging

  return (
    <div className="relative md:hidden flex items-center space-x-2">
      <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
        <Image src={burgerMenu} width={50} height={50} alt="burger menu" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-lg shadow-xl z-30 block">
          {session?.user ? (
            <>
              <div className="px-4 py-2 space-y-2">
                <p className="text-black"> Hello, {session?.user?.name}</p>
                <Button className="w-full bg-primary text-center mx-auto h-8 text-white">
                  <a
                    href={`/user`}
                    className="text-white pl-5 flex justify-between"
                  >
                    My Account
                    <div className="px-2">
                      {" "}
                      <User />
                    </div>
                  </a>
                </Button>
                <UserSignOut />
              </div>
            </>
          ) : (
            <div className="px-4 py-2">
              <UserSignIn />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
