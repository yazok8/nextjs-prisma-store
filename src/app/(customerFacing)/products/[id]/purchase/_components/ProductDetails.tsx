import { formatCurrency } from "@/lib/formatters";
import Image from "next/image";
import { Button } from "../_components/Button";
import Link from "next/link";

type ProductProps = {
    product: {
      id:string
      imagePath: string;
      name: string;
      priceInCents: number;
      description: string;
    };
};

export default function ProductDetails({product}:ProductProps){
    return (
        <>
        <div className="flex gap-4 items-center">
        <div className="aspect-video flex-shrink-0 w-1/12 relative justify-start">
          <Image
            src={product.imagePath}
            fill
            alt={product.name}
            className="object-cover"
          />
        </div>
        <div className="aspect-video flex-shrink-0 w-1/4 relative justify-end flex-reverse">
          <Image
            src={product.imagePath}
            fill
            alt={product.name}
            className="object-cover"
          />
        </div>


        <div>
          <div className="text-lg">
            {formatCurrency(product.priceInCents / 100)}
          </div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="line-clamp-3 text-muted-foreground">
            {product.description}
          </div>
        </div>
      </div>
      <Button asChild size="lg" className="w-52 mx-auto text-center flex"><Link href={`/products/${product.id}/purchase`}>Purchase</Link></Button>
        </>
    )

}