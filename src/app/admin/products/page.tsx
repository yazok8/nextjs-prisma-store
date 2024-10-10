import { Button } from "@/components/ui/button";
import { PageHeader } from "../_components/PageHeader";
import Link from "next/link";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import db from "@/db/db";
import { CheckCircle2, MoreVertical, XCircle } from "lucide-react";
import { formatCurrency, formatNumber } from '../../../lib/formatters';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ActiveToggleDropDownItem, DeleteDropDownItem } from "./_components/ProductAction";

export default function AdminProductsPage() {
  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <PageHeader>Products</PageHeader>
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>
      <ProductsTable />
    </>
  );
}

async function ProductsTable() {
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      priceInCents: true,
      isAvailableForPurchase: true,
      _count: { select: { orderProducts: true } }, // Update to `orderProducts`
    },
    orderBy: { name: "asc" },
  });

  if (products.length === 0) return <p>No Products Found</p>;

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
      <thead>
        <tr>
          <th
            scope="col"
            className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
          >
            <span className="sr-only">Available for purchase</span>
          </th>
          <th
            scope="col"
            className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
          >
            Name
          </th>
          <th
            scope="col"
            className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
          >
            Price
          </th>
          <th
            scope="col"
            className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
          >
            Orders
          </th>
          <th
            scope="col"
            className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
          >
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              {product.isAvailableForPurchase ? (
                <>
                  <CheckCircle2 />
                  <span className="sr-only"></span>
                </>
              ) : (
                <>
                  <span className="sr-only"></span>
                  <XCircle className="stroke-destructive" />
                </>
              )}
            </TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>{formatCurrency(product.priceInCents / 100)}</TableCell>
            <TableCell>{formatNumber(product._count.orderProducts)}</TableCell> {/* Updated to orderProducts */}
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical />
                  <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <a download href={`/admin/products/${product.id}/download`}>
                      Download
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                  </DropdownMenuItem>
                  <ActiveToggleDropDownItem
                    id={product.id}
                    isAvailableForPurchase={product.isAvailableForPurchase}
                  />
                  <DropdownMenuSeparator />
                  <DeleteDropDownItem id={product.id} disabled={product._count.orderProducts > 0} />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </table>
  );
}

