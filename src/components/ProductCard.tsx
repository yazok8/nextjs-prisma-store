import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";


type ProductCardProps ={
    id:string
    name:string
    priceInCents:number
    description:string
    imagePath:string
}

export function ProductCard({id,name, priceInCents, description, imagePath}:ProductCardProps){
    return <Card className="flex overflow-hidden flex-col">
        <div className="relative w-full h-auto aspect-video">
        <Link href={`/products/${id}`}>   
            <Image src={imagePath} fill alt={name} />
            </Link>
        </div>
        <CardHeader>
        <Link href={`/products/${id}`}>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{formatCurrency(priceInCents/100)}</CardDescription>
            </Link>
        </CardHeader>
        <CardContent className="flex-grow">
        <Link href={`/products/${id}`}>
            <p className="line-clamp-4">{description}</p>
            </Link>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <Button asChild size="lg" className="w-full lg:px-16"><Link href={`/products/${id}/purchase`}>Purchase now</Link></Button>
        </CardFooter>
    </Card>
}

export function ProductCardSkeleton(){
    return <Card className="flex overflow-hidden flex-col animate-pulse">
        <div className="w-full aspect-video bg-grey-300"/>
        <CardHeader>
            <CardTitle>
                <div className="w-3/4 h-6 rounded-full bg-gray-300"/>
            </CardTitle>
            <CardDescription>
                <div className="w-1/2 h-4 rounded-full bg-gray-300"/>
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
        <div className="w-full h-4 rounded-full bg-gray-300"/>
        <div className="w-full h-4 rounded-full bg-gray-300"/>
        <div className="w-3/4 h-4 rounded-full bg-gray-300"/>
        </CardContent>
        <CardFooter>
            <Button asChild size="lg" className="w-full"></Button>
        </CardFooter>
    </Card>

}
