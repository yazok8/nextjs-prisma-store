"use client"


import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteDiscoundCode, toggleDiscountCodeActive } from '../../_actions/discountCodes';

export function ActiveToggleDropDownItem({id, isActive }:{id:string, isActive:boolean}){

    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    return <DropdownMenuItem
    disabled={isPending} 
    onClick={()=>{
        startTransition(async ()=>{
            await toggleDiscountCodeActive(id, !isActive)
            router.refresh()
        })
    }}>
    {isActive ? "Deactivate":"Activate"}    
    </DropdownMenuItem>
    

}

export function DeleteDropDownItem({id,disabled}:{id:string, disabled:boolean}){
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    return <DropdownMenuItem
    variant='destructive'
    disabled={disabled || isPending} 
    onClick={()=>{
        startTransition(async ()=>{
            await deleteDiscoundCode(id)
            router.refresh()
        })
    }}>
    Delete
    </DropdownMenuItem>
    

}