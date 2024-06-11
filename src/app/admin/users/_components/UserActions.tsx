"use client"

import { useRouter } from "next/navigation"

import { useTransition } from "react"
import { deleteUser } from "../../_actions/users"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export function DeleteDropDownItem({id,disabled}:{id:string, disabled:boolean}){
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    return <DropdownMenuItem
    variant='destructive'
    disabled={disabled || isPending} 
    onClick={()=>{
        startTransition(async ()=>{
            await deleteUser(id)
            router.refresh()
        })
    }}>
    Delete
    </DropdownMenuItem>
    

}