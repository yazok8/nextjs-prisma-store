"use client";

import { CartContextProvider } from "@/app/webhooks/useCart/CartContext";

interface CartProviderProps{
    children:React.ReactNode;
}


const CartProvider:React.FC<CartProviderProps>=({children})=>{
    return(
         <CartContextProvider>{children}</CartContextProvider>
    )
}

export default CartProvider;