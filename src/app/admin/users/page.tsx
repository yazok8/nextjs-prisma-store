import { PageHeader } from "../_components/PageHeader";
import {
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {prisma} from '@/lib/prisma';
import { MoreVertical } from "lucide-react";
import { formatCurrency, formatNumber } from '../../../lib/formatters';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeleteDropDownItem } from "./_components/UserActions";

function getUsers() {
  return prisma.user.findMany({select:
    {id:true,
        email:true,
        orders:{select:{pricePaidInCents:true}}
    },
orderBy:{createdAt:"desc"}})
}

export default function UsersPage(){
    return(
        <>
        <PageHeader>Customers</PageHeader>
        <UsersTable/>
        </>
    )
}
async function UsersTable() {
    const users=await getUsers()

  if(users.length === 0) return <p>No Users Found</p>

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
      <thead>
        <tr>
          <th scope="col" className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">email</th>
          <th scope="col" className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Orders</th>
          <th scope="col" className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">Value</th>
          <th scope="col" className="text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <TableBody>
        {users.map(user=>(
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell>{formatNumber(user.orders.length)}</TableCell>
            <TableCell>{formatCurrency(user.orders.reduce((sum,o)=>o.pricePaidInCents+sum,0)/100)}</TableCell>
            <TableCell className="text-center">
              <DropdownMenu>
                <DropdownMenuTrigger>
                <MoreVertical />
                <span className="sr-only">Actions</span>
                </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DeleteDropDownItem id={user.id}/>
            </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </table>
  );
}
