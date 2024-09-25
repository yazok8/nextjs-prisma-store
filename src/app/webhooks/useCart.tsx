import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CartProductType } from "../(customerFacing)/products/[id]/purchase/_components/ProductDetails";
import { useToast } from "@/components/ui/use-toast";
import { CheckIcon, CircleXIcon, CrossIcon, X } from "lucide-react";

// Define the CartContext value using typescript
type CartContextType = {
  cartTotalQty: number; // The total quantity of items in the cart
  cartProducts: CartProductType[] | null;
  handleAddProductToCart: (product: CartProductType) => void;
  handleRemoveCartProduct: (product: CartProductType) => void;
  handleCartQuantityIncrease: (product: CartProductType) => void;
  handleCartQuantityDecrease: (product: CartProductType) => void;
  handleClearCart: () => void;
  cartSubTotalAmount:number;
};

// Create a context with the defined type, initialized to null
export const CartContext = createContext<CartContextType | null>(null);

interface Props {
  [propName: string]: any; // Allow the provider to accept any additional props
}

// The CartContextProvider component will wrap parts of the app that need access to the cart context
export const CartContextProvider = (props: Props) => {
  const { toast } = useToast();

  // State to keep track of the total quantity of items in the cart
  const [cartTotalQty, setCartTotalQty] = useState(0);
  const [cartSubTotalAmount, setCartSubTotalAmount] = useState(0)
  const [cartProducts, setCartProducts] = useState<CartProductType[] | null>(
    null
  );

  useEffect(() => {
    const cartItems: any = localStorage.getItem("eStoreCartItems");
    const cItems: CartProductType[] | null = JSON.parse(cartItems);
    setCartProducts(cItems);
  }, []);

  useEffect(() => {
    const getTotals = () => {
      if (cartProducts) {
        const { total, qty } = cartProducts?.reduce(
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
        setCartTotalQty(qty)
        setCartSubTotalAmount(total)
      }
    };
    getTotals();
  }, [cartProducts]);

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
                successfully updated to cart
              </span>
            </div>
          ),
        });
        localStorage.setItem("eStoreCartItems", JSON.stringify(updatedCart));
        return updatedCart;
      });
    },
    [cartProducts]
  );

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
              <span className="first-letter:capitalize">product removed</span>
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
    [cartProducts]
  );

  const handleCartQuantityIncrease = useCallback(
    (product: CartProductType) => {
      let updatedCart;
      if (product.Quantity === 99) {
        return toast({
          title: (
            <div className="flex items-center text-md text-white">
              <CircleXIcon className="mr-2" />
              <span className="first-letter:capitalize">
                oops maximun quantity reached
              </span>
            </div>
          ),
          variant: "destructive",
        });
      }

      if (cartProducts) {
        updatedCart = [...cartProducts];

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
    [cartProducts]
  );

  const handleCartQuantityDecrease = useCallback(
    (product: CartProductType) => {
      let updatedCart;
      if (product.Quantity === 1) {
        return toast({
          title: (
            <div className="flex items-center text-md text-white">
              <CircleXIcon className="mr-2" />
              <span className="first-letter:capitalize">
                oops minimum quantity reached
              </span>
            </div>
          ),
          variant: "destructive",
        });
      }

      if (cartProducts) {
        updatedCart = [...cartProducts];

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
    [cartProducts]
  );

  const handleClearCart = useCallback(() => {
    setCartProducts(null);
    setCartTotalQty(0);
    localStorage.setItem("eStoreCartItems", JSON.stringify(null));
  }, [cartProducts]);

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
