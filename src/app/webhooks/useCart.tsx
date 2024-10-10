// src/app/webhooks/useCart.tsx

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
import { CartProductType } from "../(customerFacing)/products/[id]/purchase/_components/ProductDetails";
import { useToast } from "@/components/ui/use-toast";
import { CheckIcon, CircleXIcon } from "lucide-react";

// Define the type for the toast function
type ToastFunction = (options: { title: ReactNode; variant?: "destructive" | "default" }) => void;

// Define a custom Router type with the methods you need
type Router = {
  push: (url: string) => void;
};

// Define the CartContext value using TypeScript
type CartContextType = {
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
  clientSecret: string;
  initializePaymentIntent: (router: Router, toast: ToastFunction) => void;
};

// Create a context with the defined type, initialized to null
export const CartContext = createContext<CartContextType | null>(null);

interface Props {
  [propName: string]: any;
}

// The CartContextProvider component
export const CartContextProvider = (props: Props) => {
  const { toast } = useToast();

  // State variables
  const [cartTotalQty, setCartTotalQty] = useState(0);
  const [cartSubTotalAmount, setCartSubTotalAmount] = useState(0);
  const [cartProducts, setCartProducts] = useState<CartProductType[] | null>(
    null
  );
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState("");

  // Use a ref to keep track of initialization
  const initialized = useRef(false);

  // Load cart products and payment intent from local storage on mount
  useEffect(() => {
    const cartItems = localStorage.getItem("eStoreCartItems");
    const cItems: CartProductType[] | null = cartItems
      ? JSON.parse(cartItems)
      : null;
    const eShopPaymentIntent = localStorage.getItem("eShopPaymentIntent");
    const storedPaymentIntent: string | null = eShopPaymentIntent
      ? JSON.parse(eShopPaymentIntent)
      : null;

    setCartProducts(cItems);
    setPaymentIntent(storedPaymentIntent);
  }, []);

  // Calculate totals whenever cartProducts change
  useEffect(() => {
    const getTotals = () => {
      if (cartProducts && cartProducts.length > 0) {
        const { total, qty } = cartProducts.reduce(
          (acc, item) => {
            const itemTotal = item.priceInCents * item.Quantity;

            acc.total += itemTotal;
            acc.qty += item.Quantity;

            return acc;
          },
          {
            total: 0,
            qty: 0,
          }
        );
        setCartTotalQty(qty);
        setCartSubTotalAmount(total);
      } else {
        setCartTotalQty(0);
        setCartSubTotalAmount(0);
      }
    };
    getTotals();
  }, [cartProducts]);

  // Function to add a product to the cart
  const handleAddProductToCart = useCallback(
    (product: CartProductType) => {
      setCartProducts((prev) => {
        let updatedCart;

        if (prev) {
          updatedCart = [...prev, product];
        } else {
          updatedCart = [product];
        }
        toast({
          title: (
            <div className="flex items-center">
              <CheckIcon className="mr-2" />
              <span className="first-letter:capitalize">
                Successfully added to cart
              </span>
            </div>
          ),
        });
        localStorage.setItem("eStoreCartItems", JSON.stringify(updatedCart));
        return updatedCart;
      });
    },
    [toast]
  );

  // Function to remove a product from the cart
  const handleRemoveCartProduct = useCallback(
    (product: CartProductType) => {
      if (cartProducts) {
        const filteredProducts = cartProducts.filter((item) => {
          return item.id !== product.id;
        });
        setCartProducts(filteredProducts);
        toast({
          title: (
            <div className="flex items-center">
              <CircleXIcon className="mr-2" />
              <span className="first-letter:capitalize">Product removed</span>
            </div>
          ),
          variant: "destructive",
        });
        localStorage.setItem(
          "eStoreCartItems",
          JSON.stringify(filteredProducts)
        );
      }
    },
    [cartProducts, toast]
  );

  // Function to increase the quantity of a product in the cart
  const handleCartQuantityIncrease = useCallback(
    (product: CartProductType) => {
      if (product.Quantity === 99) {
        return toast({
          title: (
            <div className="flex items-center text-md text-white">
              <CircleXIcon className="mr-2" />
              <span className="first-letter:capitalize">
                Maximum quantity reached
              </span>
            </div>
          ),
          variant: "destructive",
        });
      }

      if (cartProducts) {
        const updatedCart = [...cartProducts];

        const existingIndex = cartProducts.findIndex(
          (item) => item.id === product.id
        );

        if (existingIndex > -1) {
          updatedCart[existingIndex].Quantity =
            updatedCart[existingIndex].Quantity + 1;
        }

        setCartProducts(updatedCart);
        localStorage.setItem("eStoreCartItems", JSON.stringify(updatedCart));
      }
    },
    [cartProducts, toast]
  );

  // Function to decrease the quantity of a product in the cart
  const handleCartQuantityDecrease = useCallback(
    (product: CartProductType) => {
      if (product.Quantity === 1) {
        return toast({
          title: (
            <div className="flex items-center text-md text-white">
              <CircleXIcon className="mr-2" />
              <span className="first-letter:capitalize">
                Minimum quantity reached
              </span>
            </div>
          ),
          variant: "destructive",
        });
      }

      if (cartProducts) {
        const updatedCart = [...cartProducts];

        const existingIndex = cartProducts.findIndex(
          (item) => item.id === product.id
        );

        if (existingIndex > -1) {
          updatedCart[existingIndex].Quantity =
            updatedCart[existingIndex].Quantity - 1;
        }

        setCartProducts(updatedCart);
        localStorage.setItem("eStoreCartItems", JSON.stringify(updatedCart));
      }
    },
    [cartProducts, toast]
  );

  // Function to clear the cart
  const handleClearCart = useCallback(() => {
    setCartProducts(null);
    setCartTotalQty(0);
    setCartSubTotalAmount(0);
    localStorage.removeItem("eStoreCartItems");
  }, []);

  // Function to set the paymentIntent and store it in localStorage
  const handleSetPaymentIntent = useCallback((val: string | null) => {
    setPaymentIntent(val);
    localStorage.setItem("eShopPaymentIntent", JSON.stringify(val));
  }, []);

  // Function to initialize the payment intent
  const initializePaymentIntent = useCallback(
    async (router: Router, toast: ToastFunction) => {
      if (initialized.current || !cartProducts || cartProducts.length === 0)
        return;
  
      initialized.current = true;
  
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            items: cartProducts,
            payment_intent_id: paymentIntent,
          }),
        });
  
        if (res.status === 401) {
          router.push("/login");
          return;
        }
  
        const data = await res.json();
  
        handleSetPaymentIntent(data.paymentIntent.id);
        setClientSecret(data.paymentIntent.client_secret);
        localStorage.setItem("eShopClientSecret", JSON.stringify(data.paymentIntent.client_secret));
      } catch (error) {
        console.error("Error initializing payment intent:", error);
        toast({
          title: (
            <div className="flex items-center">
              <CircleXIcon className="mr-2" />
              <span className="first-letter:capitalize">
                Something went wrong!
              </span>
            </div>
          ),
          variant: "destructive",
        });
      }
    },
    [cartProducts, paymentIntent, handleSetPaymentIntent]
  );

  // The value that will be provided to consuming components
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

  // Render the context provider with the value, passing along any additional props
  return <CartContext.Provider value={value} {...props} />;
};

// Custom hook for consuming the CartContext
export const useCart = () => {
  // Retrieve the context value
  const context = useContext(CartContext);

  if (context == null) {
    throw new Error("useCart must be used within a CartContextProvider");
  }

  return context;
};
