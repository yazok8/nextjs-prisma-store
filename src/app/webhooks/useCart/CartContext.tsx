"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import { CartProductType } from "../../(customerFacing)/products/[id]/purchase/_components/ProductDetails";

import { storage } from "./storage";
import { calculateTotals } from "./utils";
import { toastMessages } from "./toasts";
import { CartContextType, Router, ToastProps } from "@/types/CartTypes";

const CartContext = createContext<CartContextType | null>(null);

export const CartContextProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const initialized = useRef(false);
  const previousUserId = useRef<string | null>(null);

  const [cartTotalQty, setCartTotalQty] = useState(0);
  const [cartSubTotalAmount, setCartSubTotalAmount] = useState(0);
  const [cartProducts, setCartProducts] = useState<CartProductType[] | null>(() => {
    // Initialize cart from storage on mount
    if (typeof window !== 'undefined') {
      const cartKey = storage.getCartKey(session?.user?.id);
      return storage.getCartItems(cartKey);
    }
    return null;
  });
  const [paymentIntent, setPaymentIntent] = useState<string | null>(() => {
    // Initialize payment intent from storage on mount
    if (typeof window !== 'undefined') {
      return storage.getPaymentIntent();
    }
    return null;
  });
  const [clientSecret, setClientSecret] = useState<string | null>(() => {
    // Initialize client secret from storage on mount
    if (typeof window !== 'undefined') {
      return storage.getClientSecret();
    }
    return null;
  });

  const cartKey = storage.getCartKey(session?.user?.id);

  const handleClearCart = useCallback(() => {
    setCartProducts(null);
    setCartTotalQty(0);
    setCartSubTotalAmount(0);
    setPaymentIntent(null);
    setClientSecret(null);
    storage.clearAll(cartKey);
  }, [cartKey]);

  // Handle user session changes
  useEffect(() => {
    if (previousUserId.current && previousUserId.current !== session?.user?.id) {
      // Clear previous user's cart
      storage.clearAll(storage.getCartKey(previousUserId.current));
      
      // Load new user's cart
      const newCartKey = storage.getCartKey(session?.user?.id);
      const cartItems = storage.getCartItems(newCartKey);
      setCartProducts(cartItems);
    }
    previousUserId.current = session?.user?.id ?? null;
  }, [session]);

  // Sync cart with storage when session changes
  useEffect(() => {
    if (!session) {
      const guestCartItems = storage.getCartItems(storage.getCartKey(undefined));
      setCartProducts(guestCartItems);
      return;
    }

    const cartItems = storage.getCartItems(cartKey);
    const storedPaymentIntent = storage.getPaymentIntent();
    const storedClientSecret = storage.getClientSecret();

    if (cartItems) {
      setCartProducts(cartItems);
    }
    if (storedPaymentIntent) {
      setPaymentIntent(storedPaymentIntent);
    }
    if (storedClientSecret) {
      setClientSecret(storedClientSecret);
    }
  }, [cartKey, session]);

  // Persist cart changes to storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      storage.setCartItems(cartKey, cartProducts);
    }
  }, [cartProducts, cartKey]);

  // Update totals when cart changes
  useEffect(() => {
    const totals = calculateTotals(cartProducts);
    setCartTotalQty(totals.qty);
    setCartSubTotalAmount(totals.total);
  }, [cartProducts]);

  const handleAddProductToCart = useCallback(
    (product: CartProductType) => {
      setCartProducts((prev) => {
        const updatedCart = prev ? [...prev] : [];
        const existingIndex = updatedCart.findIndex((item) => item.id === product.id);

        if (existingIndex > -1) {
          updatedCart[existingIndex].Quantity += product.Quantity;
        } else {
          updatedCart.push(product);
        }

        toast(toastMessages.addedToCart);
        storage.setCartItems(cartKey, updatedCart);
        return updatedCart;
      });
    },
    [toast, cartKey]
  );

  const handleRemoveCartProduct = useCallback(
    (product: CartProductType) => {
      if (cartProducts) {
        const filteredProducts = cartProducts.filter(item => item.id !== product.id);
        setCartProducts(filteredProducts);
        toast(toastMessages.removedFromCart);
        storage.setCartItems(cartKey, filteredProducts);
      }
    },
    [cartProducts, toast, cartKey]
  );

  const handleCartQuantityIncrease = useCallback(
    (product: CartProductType) => {
      if (product.Quantity === 99) {
        toast(toastMessages.maxQuantityReached);
        return;
      }

      setCartProducts(prev => {
        if (!prev) return prev;
        const updatedCart = prev.map(item => 
          item.id === product.id 
            ? { ...item, Quantity: item.Quantity + 1 }
            : item
        );
        storage.setCartItems(cartKey, updatedCart);
        return updatedCart;
      });
    },
    [toast, cartKey]
  );

  const handleCartQuantityDecrease = useCallback(
    (product: CartProductType) => {
      if (product.Quantity === 1) {
        toast(toastMessages.minQuantityReached);
        return;
      }

      setCartProducts(prev => {
        if (!prev) return prev;
        const updatedCart = prev.map(item => 
          item.id === product.id 
            ? { ...item, Quantity: item.Quantity - 1 }
            : item
        );
        storage.setCartItems(cartKey, updatedCart);
        return updatedCart;
      });
    },
    [toast, cartKey]
  );

  const handleSetPaymentIntent = useCallback((val: string | null) => {
    setPaymentIntent(val);
    storage.setPaymentIntent(val);
  }, []);

  const initializePaymentIntent = useCallback(
    async (router: Router, toast: (props: ToastProps) => void) => {
      if (initialized.current || !cartProducts?.length) return;
      initialized.current = true;

      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            items: cartProducts,
            payment_intent_id: paymentIntent,
          }),
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        handleSetPaymentIntent(data.paymentIntent.id);
        setClientSecret(data.paymentIntent.client_secret);
        storage.setClientSecret(data.paymentIntent.client_secret);
      } catch (error) {
        console.error("Error initializing payment intent:", error);
        toast({
          title: "Error processing payment",
          variant: "destructive"
        });
      }
    },
    [cartProducts, paymentIntent, handleSetPaymentIntent]
  );

  const value = {
    cartTotalQty,
    cartSubTotalAmount,
    cartProducts,
    handleAddProductToCart,
    handleRemoveCartProduct,
    handleCartQuantityIncrease,
    handleCartQuantityDecrease,
    handleClearCart,
    paymentIntent,
    handleSetPaymentIntent,
    clientSecret,
    initializePaymentIntent,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartContextProvider");
  }
  return context;
};