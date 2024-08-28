"use client";

import { Button } from "@/components/ui/button";
import { signIn, signOut } from "next-auth/react";

export function UserSignOut(){
    return (
        <>
        <Button onClick={()=>signOut({
            redirect:true, 
            callbackUrl:`${window.location.origin}/`
        })} variant="destructive" style={{position:"absolute", top:"0", right:"0", paddingInline:"0", margin:"7px", padding:"10px"}}>Sign Out</Button>
    
    </>)

}

export function UserSignIn(){
    return (
        <Button onClick={()=>signIn()} className=" absolute top-0 right-0 py-0 px-10 m-2">Sign In</Button>
    )

}
