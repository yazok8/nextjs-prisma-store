import { useCart } from '@/app/webhooks/useCart'
import { ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'

export default function CartCounter() {
    const {cartTotalQty} = useCart()
    const router = useRouter()
  return (
    <div className='relative cursor-pointer' onClick={()=>router.push("/cart")}>
        <ShoppingBag className="my-auto" />
        <span className='absolute top-[-10px] bottom-[-10px] right-[-10px] bg-slate-700 text-white h-6 w-6 rounded-full flex items-center justify-center text-sm '>{cartTotalQty}</span>
    </div>
  )
}
