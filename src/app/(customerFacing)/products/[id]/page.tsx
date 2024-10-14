// src/app/(customerFacing)/products/[id]/page.tsx

import db from "@/db/db";
import { notFound } from "next/navigation";
import ProductDetails from "./purchase/_components/ProductDetails";

type ProductPageProps = {
  product: {
    id: string;
    imagePath: string;
    name: string;
    priceInCents: number;
    description: string;
    category: string; // Ensuring category is a string
  };
};

export default async function ProductPage({
  params: { id },
}: {
  params: { id: string };
}) {
  // Fetch the product along with its category
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true }, // Include category details
  });

  if (product == null) return notFound();

  // Transform the product data to match ProductPageProps
  const updatedProduct: ProductPageProps['product'] = {
    id: product.id,
    imagePath: product.imagePath,
    name: product.name,
    priceInCents: product.priceInCents,
    description: product.description,
    category: product.category ? product.category.name : 'Uncategorized', // Extract category name
  };

  console.log(updatedProduct);
  
  return <ProductDetails product={updatedProduct} />;
}
