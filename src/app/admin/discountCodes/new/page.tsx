import {prisma} from '@/lib/prisma';
import { PageHeader } from "../../_components/PageHeader";
import { DiscountCodeForm } from "../_components/DiscountCodeForm";

export default async function NewDiscountCodePage(){
    const products = await prisma.product.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    
    return (
        <>
        <PageHeader>Add Product</PageHeader>
        <DiscountCodeForm products={products} />
      </>
    )
}