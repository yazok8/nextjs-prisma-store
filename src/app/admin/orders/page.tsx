import { PageHeader } from "../_components/PageHeader";
import Link from "next/link";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import db from "@/db/db";
import { Minus, MoreVertical } from "lucide-react";
import { formatCurrency, formatNumber } from '../../../lib/formatters';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteDropDownItem } from "./_components/OrdersActions";

function getOrders() {
  return db.order.findMany({select:
    {id:true,
        pricePaidInCents:true,
        product:{select:{name:true}},
        user:{select:{email:true}},
        DiscountCode: {select:{code:true}}
    },
    orderBy:{createdAt:"desc"}})
}

export default function OrdersPage(){
    return(
        <>
        <PageHeader>Customers</PageHeader>
        <OrdersTable/>
        </>
    )
}
async function OrdersTable() {
    const orders=await getOrders()

  if(orders.length === 0) return <p>No Orders Found</p>

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
      <thead>
        <tr>
          <th scope="col" className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Product</th>
          <th scope="col" className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Customer</th>
          <th scope="col" className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Price Paid</th>
          <th scope="col" className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Coupon</th>
          <th scope="col" className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <TableBody>
        {orders.map(order=>(
          <TableRow key={order.id}>
            <TableCell>{order.product.name}</TableCell>
            <TableCell>{order.user.email}</TableCell>
            <TableCell>{formatCurrency(order.pricePaidInCents/100)}</TableCell>
            <TableCell>{order.DiscountCode==null ? <Minus/>: order.DiscountCode.code}</TableCell>
            <TableCell className="text-center">
              <DropdownMenu>
                <DropdownMenuTrigger>
                <MoreVertical />
                <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DeleteDropDownItem id={order.id}/>
            </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </table>
  );
}
