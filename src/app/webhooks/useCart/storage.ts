import { CartProductType } from "../../(customerFacing)/products/[id]/purchase/_components/ProductDetails";

export const storage = {
  getCartKey: (userId: string | undefined) => 
    userId ? `eStoreCartItems_${userId}` : "eStoreCartItems_guest",

  getCartItems: (cartKey: string) => {
    const items = localStorage.getItem(cartKey);
    return items ? JSON.parse(items) as CartProductType[] : null;
  },

  setCartItems: (cartKey: string, items: CartProductType[] | null) => {
    if (items) {
      localStorage.setItem(cartKey, JSON.stringify(items));
    } else {
      localStorage.removeItem(cartKey);
    }
  },

  getPaymentIntent: () => {
    const intent = localStorage.getItem("eShopPaymentIntent");
    return intent ? JSON.parse(intent) as string : null;
  },

  setPaymentIntent: (intent: string | null) => {
    if (intent) {
      localStorage.setItem("eShopPaymentIntent", JSON.stringify(intent));
    } else {
      localStorage.removeItem("eShopPaymentIntent");
    }
  },

  getClientSecret: () => {
    const secret = localStorage.getItem("eShopClientSecret");
    return secret ? JSON.parse(secret) as string : null;
  },

  setClientSecret: (secret: string | null) => {
    if (secret) {
      localStorage.setItem("eShopClientSecret", JSON.stringify(secret));
    } else {
      localStorage.removeItem("eShopClientSecret");
    }
  },

  clearAll: (cartKey: string) => {
    localStorage.removeItem(cartKey);
    localStorage.removeItem("eShopPaymentIntent");
    localStorage.removeItem("eShopClientSecret");
  }
};