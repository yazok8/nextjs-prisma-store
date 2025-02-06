import { CartProductType } from "@/app/(customerFacing)/products/[id]/purchase/_components/ProductDetails";
import { ReactNode } from "react";


export type ToastFunction = (options: {
  title: ReactNode;
  variant?: "destructive" | "default";
}) => void;

export type Router = {
  push: (url: string) => void;
};

export type CartContextType = {
  cartTotalQty: number;
  cartProducts: CartProductType[] | null;
  handleAddProductToCart: (product: CartProductType) => void;
  handleRemoveCartProduct: (product: CartProductType) => void;
  handleCartQuantityIncrease: (product: CartProductType) => void;
  handleCartQuantityDecrease: (product: CartProductType) => void;
  handleClearCart: () => void;
  cartSubTotalAmount: number;
  paymentIntent: string | null;
  handleSetPaymentIntent: (val: string | null) => void;
  clientSecret: string | null;
  initializePaymentIntent: (router: Router, toast: ToastFunction) => void;
};