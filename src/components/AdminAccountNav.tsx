"use client";

import { Button } from "@/components/ui/button";
import { signIn, signOut } from "next-auth/react";

export function AdminSignOut() {
    return (
      <div className="w-full">
        <Button
          onClick={() =>
            signOut({
              redirect: true,
              callbackUrl: `${window.location.origin}/admin`,
            })
          }
          variant="destructive"
          className="w-full py-2 hover:bg-secondary hover:text-secondary-foreground h-8"
        >
          Sign Out
        </Button>
      </div>
    );
  }

  export function AdminSignIn() {
    return (
      <div className="w-full">
        <Button
          onClick={() => signIn()}
          className="w-full py-2 hover:bg-secondary hover:text-secondary-foreground"
        >
          Sign In
        </Button>
      </div>
    );
  }
