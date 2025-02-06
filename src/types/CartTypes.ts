import { CartProductType } from "@/app/(customerFacing)/products/[id]/purchase/_components/ProductDetails";
import { ReactNode } from "react";



export type ToastProps = { 
  title: string; 
  description?: string; 
  variant?: "default" | "destructive" 
};


export type Router = {
  push: (url: string) => void;
};

export interface CartContextType {
  cartTotalQty: number;
  cartSubTotalAmount: number;
  cartProducts: CartProductType[] | null;
  handleAddProductToCart: (product: CartProductType) => void;
  handleRemoveCartProduct: (product: CartProductType) => void;
  handleCartQuantityIncrease: (product: CartProductType) => void;
  handleCartQuantityDecrease: (product: CartProductType) => void;
  handleClearCart: () => void;
  paymentIntent: string | null;
  handleSetPaymentIntent: (val: string | null) => void;
  clientSecret: string | null;
  initializePaymentIntent: (
    router: Router,
    toast: (props: ToastProps) => void
  ) => Promise<void>;
}