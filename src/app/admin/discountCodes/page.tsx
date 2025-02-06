// src/app/admin/discountCodes/page.tsx

import { Button } from "@/components/ui/button";
import { PageHeader } from "../_components/PageHeader";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  Infinity,
  Minus,
  MoreVertical,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { prisma } from '@/lib/prisma'; // Named export
import { Prisma } from "@prisma/client";
import {
  formatDateTime,
  formatDiscountCode,
  formatNumber,
} from "@/lib/formatters";
import { ActiveToggleDropDownItem, DeleteDropDownItem } from "./_components/discountCodeActions";

// Define a type that includes the count of orders
type DiscountCodeWithOrderCount = Prisma.DiscountCodeGetPayload<{
  select: {
    id: true;
    allProducts: true;
    code: true;
    discountAmount: true;
    discountType: true;
    expiresAt: true;
    limit: true;
    uses: true;
    isActive: true;
    _count: { select: { orders: true } };
  };
}>;

// Select fields including the count of orders
const SELECT_FIELDS: Prisma.DiscountCodeSelect = {
  id: true,
  allProducts: true,
  code: true,
  discountAmount: true,
  discountType: true,
  expiresAt: true,
  limit: true,
  uses: true,
  isActive: true,
  _count: { select: { orders: true } },
};

// Fetch expired discount codes
async function getExpiredDiscountCodes(): Promise<DiscountCodeWithOrderCount[]> {
  return prisma.discountCode.findMany({
    select: SELECT_FIELDS,
    where: {
      OR: [
        { limit: { lte: 0 } },
        { expiresAt: { lte: new Date() } },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
}

// Fetch unexpired discount codes
async function getUnexpiredDiscountCodes(): Promise<DiscountCodeWithOrderCount[]> {
  return prisma.discountCode.findMany({
    select: SELECT_FIELDS,
    where: {
      limit: { gt: 0 },
      OR: [
        { expiresAt: { gt: new Date() } },
        { expiresAt: null },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
}

// Main Page Component
export default async function DiscountCodesPage() {
  try {
    // Fetch both expired and unexpired discount codes concurrently
    const [expiredDiscountCodes, unexpiredDiscountCodes] = await Promise.all([
      getExpiredDiscountCodes(),
      getUnexpiredDiscountCodes(),
    ]);

    console.log("Unexpired Discount Codes:", unexpiredDiscountCodes);
    console.log("Expired Discount Codes:", expiredDiscountCodes);

    return (
      <>
        <div className="flex justify-between items-center gap-4">
          <PageHeader>Coupons</PageHeader>
          <Button asChild>
            <Link href="/admin/discountCodes/new">Add Coupon</Link>
          </Button>
        </div>

        {/* Unexpired Discount Codes */}
        <DiscountCodesTable
          discountCodes={unexpiredDiscountCodes}
          canDeactivate
        />

        {/* Expired Discount Codes */}
        <div className="mt-8">
          <h2 className="text-xl font-bold">Expired Coupons</h2>
          <DiscountCodesTable discountCodes={expiredDiscountCodes} isInactive />
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching discount codes:", error);
    return <div className="text-destructive">Failed to load discount codes.</div>;
  }
}

// Component Props Type
type DiscountCodesTableProps = {
  discountCodes: DiscountCodeWithOrderCount[];
  isInactive?: boolean;
  canDeactivate?: boolean;
};

// Discount Codes Table Component
function DiscountCodesTable({
  discountCodes,
  isInactive = false,
  canDeactivate = false,
}: DiscountCodesTableProps) {
  if (discountCodes.length === 0) {
    return <div className="text-muted-foreground">No discount codes found.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-0">
            <span className="sr-only">Is Active</span>
          </TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead>Remaining Uses</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead className="w-0">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {discountCodes.map(discountCode => (
          <TableRow key={discountCode.id}>
            <TableCell>
              {discountCode.isActive && !isInactive ? (
                <>
                  <span className="sr-only">Active</span>
                  <CheckCircle2 className="text-green-500" />
                </>
              ) : (
                <>
                  <span className="sr-only">Inactive</span>
                  <XCircle className="stroke-destructive text-red-500" />
                </>
              )}
            </TableCell>
            <TableCell>{discountCode.code}</TableCell>
            <TableCell>{formatDiscountCode(discountCode)}</TableCell>
            <TableCell>
              {discountCode.expiresAt == null ? (
                <Minus />
              ) : (
                formatDateTime(discountCode.expiresAt)
              )}
            </TableCell>
            <TableCell>
              {discountCode.limit == null ? (
                <Infinity />
              ) : (
                formatNumber(discountCode.limit - discountCode.uses)
              )}
            </TableCell>
            <TableCell>{formatNumber(discountCode._count.orders)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical />
                  <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {canDeactivate && (
                    <>
                      <ActiveToggleDropDownItem
                        id={discountCode.id}
                        isActive={discountCode.isActive}
                      />
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DeleteDropDownItem
                    id={discountCode.id}
                    disabled={discountCode._count.orders > 0}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
