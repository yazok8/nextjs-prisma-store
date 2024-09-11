import React from "react";
import { CartProductType } from "../[id]/purchase/_components/ProductDetails";

interface SetQuantityProps {
  cartCounter?: boolean;
  cartProduct: CartProductType;
  handleCartQuantityIncrease: () => void;
  handleCartQuantityDecrease: () => void;
}

const btnStyles = 'border-[1.2px] border-slace-300 px-2 rounded'

export default function SetQuantity({
  cartCounter,
  cartProduct,
  handleCartQuantityIncrease,
  handleCartQuantityDecrease,
}: SetQuantityProps) {
  return (
    <div className="flex gap-8 items-center">
      {cartCounter ? null : <div className="font-semibold">Quantity</div>} 
    <div className="flex gap-4 items-center text-base">
        <button onClick={handleCartQuantityDecrease} className={btnStyles}>-</button>
        <div>{cartProduct.Quantity}</div>
        <button onClick={handleCartQuantityIncrease} className={btnStyles}>+</button>
    </div>
    </div>
  );
}
