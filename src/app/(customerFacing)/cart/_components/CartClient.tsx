"use client"

import { useCart } from '@/app/webhooks/useCart'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import CartItem from './CartItem'
import { formatCurrency } from '@/lib/formatters';

function CartClient() {
    const {cartProducts, handleClearCart,cartSubTotalAmount} = useCart()
    
    if(!cartProducts || cartProducts.length === 0){
        return (
            <div className='flex flex-col items-center'>
                <div className='text-2xl'>You cart is empty</div>
                <div>
                    <Link href="/" className="text-slate-500 flex items-center gap-1 mt-2">
                    <ArrowLeft />
                    <span>Start Shopping</span>
                    </Link>
                </div>
            </div>
        )
    }
  return (
    <div>
        <h2 className='text-center'>Shopping Cart</h2>
        <div className='grid grid-cols-5 text-sx gap-4 pb-2 items-center'>
            <div className="col-span-2 justify-self-start">Product</div>
            <div className='justify-self-center'>Price</div>
            <div className='justify-self-center'>Quantity</div>
            <div className='justify-self-end'>Total</div>
        </div>
        <div>
        {cartProducts && cartProducts.map((item)=>{
            return <CartItem key={item.id} item={item} />
        })}
        </div>
        <div className='border-t-[1.5px] border-slate-200 py-4 flex justify-between gap-4'>
            <div className='w-[90px]'>
                <Button onClick={()=>{handleClearCart()}} variant="outline">Clear Cart</Button>
            </div>
            <div className='text-sm flex flex-col gap-1 items-start'>
                <div className='flex justify-between w-full text-base font-semibold'>
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartSubTotalAmount/100)}</span>
                </div>
                <p>Taxes & shopping calculate at checkout</p>
                <Button onClick={()=>{}} className='w-full'><Link href={"/"}>Checkout</Link></Button>
                <Link href="/" className="text-slate-500 flex items-center gap-1 mt-2">
                    <ArrowLeft />
                    <span>Continue Shopping</span>
                    </Link>
            </div>
        </div>
    </div>
  )
}

export default CartClient