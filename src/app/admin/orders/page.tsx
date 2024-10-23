import { PageHeader } from "../_components/PageHeader";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
prisma;
import { Minus, MoreVertical } from "lucide-react";
import { formatCurrency } from "../../../lib/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDropDownItem } from "./_components/OrdersActions";
import { prisma } from "@/lib/prisma";

function getOrders() {
  return prisma.order.findMany({
    select: {
      id: true,
      pricePaidInCents: true,
      orderProducts: { select: { product: true } },
      user: { select: { email: true } },
      DiscountCode: { select: { code: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default function OrdersPage() {
  return (
    <>
      <PageHeader>Customers</PageHeader>
      <OrdersTable />
    </>
  );
}
async function OrdersTable() {
  const orders = await getOrders();

  if (orders.length === 0) return <p>No Orders Found</p>;

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
      <thead>
        <tr>
          <th
            scope="col"
            className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
          >
            Product
          </th>
          <th
            scope="col"
            className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
          >
            Customer
          </th>
          <th
            scope="col"
            className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
          >
            Price Paid
          </th>
          <th
            scope="col"
            className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
          >
            Coupon
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
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              {order.orderProducts.length > 0
                ? order.orderProducts.map((op) => op.product.name).join(", ")
                : "No products"}
            </TableCell>
            <TableCell>{order.user.email}</TableCell>
            <TableCell>
              {formatCurrency(order.pricePaidInCents / 100)}
            </TableCell>
            <TableCell>
              {order.DiscountCode == null ? <Minus /> : order.DiscountCode.code}
            </TableCell>
            <TableCell className="text-center">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <MoreVertical />
                  <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DeleteDropDownItem id={order.id} />
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </table>
  );
}
