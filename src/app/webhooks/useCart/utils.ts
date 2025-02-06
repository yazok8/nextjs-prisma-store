import { CartProductType } from "../../(customerFacing)/products/[id]/purchase/_components/ProductDetails";

export const calculateTotals = (cartProducts: CartProductType[] | null) => {
  if (!cartProducts || cartProducts.length === 0) {
    return { total: 0, qty: 0 };
  }

  return cartProducts.reduce(
    (acc, item) => {
      const itemTotal = item.priceInCents * item.Quantity;
      return {
        total: acc.total + itemTotal,
        qty: acc.qty + item.Quantity,
      };
    },
    { total: 0, qty: 0 }
  );
};