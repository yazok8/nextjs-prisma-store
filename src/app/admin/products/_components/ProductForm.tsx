"use client"

import { Label } from "@radix-ui/react-label"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { formatCurrency } from "@/lib/formatters"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { addProduct, updateProduct } from "../../_actions/products"
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom"
import { Product } from "@prisma/client"
import Image from "next/image"


export function ProductForm({product}:{product?:Product | null}){
  const router = useRouter();
  const [ error, action] = useFormState(product == null ?addProduct : updateProduct.bind(null,product.id),{})
    const [priceInCents, setPriceInCents] = useState<number | undefined>(product?.priceInCents)
    const [formData, setFormData] = useState(new FormData());


    

return (
    <form action={action} className="space-y-8">
        <div className="space-y-2">
        <Label htmlFor="name" className="text-lg">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product?.name || ""}
        />
        {error?.name&& <div className="text-destructive">{error.name}</div>}
        </div>
        <div className="space-y-2">
        <Label htmlFor="priceInCents" className="text-lg">Price In Cents</Label>
        <Input
          type="number"
          id="priceInCents"
          name="priceInCents"
          required
          value={priceInCents}
          onChange={e => setPriceInCents(Number(e.target.value))}
        />
         {error?.priceInCents && <div className="text-destructive">{error.priceInCents}</div>}
        <div className="text-muted-foreground">
            {formatCurrency((priceInCents || 0) / 100)}
        </div>
        </div>
        <div className="space-y-2">
        <Label htmlFor="description" className="text-lg">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={product?.description}
        />
        </div>
        <div className="space-y-2">
        <Label htmlFor="file" className="text-lg">File</Label>
        <Input
          type="file"
          id="file"
          name="file"
          required={product == null}
        />
        {product!=null && <div className="text-muted-foregorund">{product.filePath}</div>}
        </div>
        <div className="space-y-2">
        <Label htmlFor="image" className="text-lg">Image</Label>
        <Input
          type="file"
          id="image"
          name="image"
          required = {product == null}
        />
          {product!=null && <Image className="text-muted-foregorund" src={product.imagePath} height={400} width={400} alt="Product Image" />}
        </div>
        <SubmitButton />
    </form>
)
}

function SubmitButton(){
    const {pending} = useFormStatus()
  return <>
          <Button type="submit" disabled={pending}>{pending ? "Saving...":"Save"}</Button>
  </>
}