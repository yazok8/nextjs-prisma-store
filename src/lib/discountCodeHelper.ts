
import { DiscountCodeType, Prisma } from "@prisma/client";
import { prisma } from '@/lib/prisma';

// Function to generate a Prisma where input for finding usable discount codes
export function usableDiscountCodeWhere(productId: string) {
  return {
    isActive: true, // The discount code must be active
    AND: [
      {
        // The discount code must either apply to all products or include the specific product
        OR: [{ allProducts: true }],
      },
      {
        // The discount code must either have no usage limit or its limit hasn't been reached
        OR: [{ limit: null }, { limit: { gt: prisma.discountCode.fields.uses } }],
      },
      {
        // The discount code must either not have an expiration date or it hasn't expired
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    ],
  } satisfies Prisma.DiscountCodeWhereInput; // Ensure the object conforms to Prisma's DiscountCodeWhereInput type
}

// Function to calculate the discounted price based on the discount code
export function getDiscountedAmount(
  discountCode: { discountAmount: number; discountType: DiscountCodeType }, // Discount code with amount and type
  priceInCents: number // Original price in cents
) {
  switch (discountCode.discountType) {
    case "PERCENTAGE":
      // Calculate percentage discount and ensure the result is at least 1 cent
      return Math.max(
        1,
        Math.ceil(priceInCents - (priceInCents * discountCode.discountAmount) / 100)
      );
    case "FIXED":
      // Subtract fixed discount amount and ensure the result is at least 1 cent
      return Math.max(1, Math.ceil(priceInCents - discountCode.discountAmount));
    default:
      // Handle invalid discount types (this should never happen if types are used correctly)
      throw new Error(
        `Invalid discount type ${discountCode.discountType satisfies never}`
      );
  }
}
