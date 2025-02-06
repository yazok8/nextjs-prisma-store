import { CheckIcon, CircleIcon as CircleXIcon } from "lucide-react";

export const toastMessages = {
  addedToCart: {
    title: (
      <div className="flex items-center">
        <CheckIcon className="mr-2" />
        <span className="first-letter:capitalize">Successfully added to cart</span>
      </div>
    ),
  },
  removedFromCart: {
    title: (
      <div className="flex items-center">
        <CircleXIcon className="mr-2" />
        <span className="first-letter:capitalize">Product removed</span>
      </div>
    ),
    variant: "destructive" as const,
  },
  maxQuantityReached: {
    title: (
      <div className="flex items-center text-md text-white">
        <CircleXIcon className="mr-2" />
        <span className="first-letter:capitalize">Maximum quantity reached</span>
      </div>
    ),
    variant: "destructive" as const,
  },
  minQuantityReached: {
    title: (
      <div className="flex items-center text-md text-white">
        <CircleXIcon className="mr-2" />
        <span className="first-letter:capitalize">Minimum quantity reached</span>
      </div>
    ),
    variant: "destructive" as const,
  },
  paymentError: {
    title: (
      <div className="flex items-center">
        <CircleXIcon className="mr-2" />
        <span className="first-letter:capitalize">Something went wrong!</span>
      </div>
    ),
    variant: "destructive" as const,
  },
};