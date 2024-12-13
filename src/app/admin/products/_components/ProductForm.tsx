// src/app/admin/products/ProductForm.tsx

"use client";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/formatters";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Product } from "@prisma/client";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Category } from "@/types/Category";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { getImageSrc } from "@/lib/imageHelper"; // Import the helper function

// Type Guards for Error Handling
const isGeneralError = (errors: any): errors is { general: string[] } => {
  return errors && typeof errors === 'object' && 'general' in errors;
};

const isFieldError = (errors: any): errors is Record<string, string[]> => {
  return errors && typeof errors === 'object' && !isGeneralError(errors);
};

export function ProductForm({ product }: { product?: Product | null }) {
  const [error, setError] = useState<any>(null); // Can be string or Record<string, string[]>
  const [brand, setBrand] = useState<string>(product?.brand || "");
  const [success, setSuccess] = useState<string | null>(null);
  const [priceInCents, setPriceInCents] = useState<number | undefined>(
    product?.priceInCents
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    product?.categoryId || ""
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [pending, setPending] = useState<boolean>(false);

  const [currentImageSrc, setCurrentImageSrc] = useState<string>('');

  useEffect(() => {
    // Fetch categories from the API
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const imageSrc = getImageSrc(product?.imagePath);
    setCurrentImageSrc(imageSrc);
  }, [product]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(
        product == null ? '/api/products/addProduct' : `/api/products/updateProduct?id=${product.id}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle field-specific errors
        if (typeof data.errors === 'object') {
          setError(data.errors);
        } else {
          throw new Error(data.errors || 'Something went wrong');
        }
      } else {
        setSuccess(data.message);
        // Redirect to the admin products page
        window.location.href = "/admin/products";
      }
    } catch (err: any) {
      setError({ general: [err.message] });
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Display General Errors */}
      {isGeneralError(error) && error.general.length > 0 && (
        <div className="text-destructive">
          {error.general.map((msg, idx) => (
            <p key={idx}>{msg}</p>
          ))}
        </div>
      )}

      {/* Display Field-Specific Errors */}
      {isFieldError(error) && (
        <div className="text-destructive">
          {Object.entries(error).map(([field, messages]) => (
            <div key={field}>
              {messages.map((msg, idx) => (
                <p key={idx}>{msg}</p>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Display Success Message */}
      {success && (
        <div className="text-green-500">
          <p>{success}</p>
        </div>
      )}

      {/* Include hidden input for product ID if updating */}
      {product != null && (
        <input type="hidden" name="id" value={product.id} />
      )}

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={product?.name || ""}
        />
      </div>

      {/* Price Field */}
      <div className="space-y-2">
        <Label htmlFor="priceInCents">Price In Cents</Label>
        <Input
          type="number"
          id="priceInCents"
          name="priceInCents"
          required
          value={priceInCents}
          onChange={e => setPriceInCents(Number(e.target.value) || undefined)}
        />
        <div className="text-muted-foreground">
          {formatCurrency((priceInCents || 0) / 100)}
        </div>
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          defaultValue={product?.description}
        />
      </div>

      {/* Category Field */}
      <div className="space-y-2 text-sm">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId" // Ensure this matches the server-side expectation
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          required
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="" className="text-sm">Select a category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="brand">Brand</Label>
        <Input
          type="text"
          id="brand"
          name="brand"
          onChange={e => setBrand(e.target.value)}
          defaultValue={brand}
        />
      </div>

      {/* Image Field */}
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <Input type="file" id="image" name="image" required={product == null} />
        {product != null && currentImageSrc !== '' && (
          <Image
            src={currentImageSrc!}
            height={400}
            width={400}
            alt="Product Image"
            onError={(e) => {
              // Fallback to local image if S3 image fails to load
              const sanitizedImagePath = product.imagePath.startsWith('/')
                ? product.imagePath.slice(1)
                : product.imagePath;
              const localImageUrl = `/products/${sanitizedImagePath}`;
              setCurrentImageSrc(localImageUrl);
            }}
          />
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden animate-pulse max-w-[85%] mx-auto">
      <div className="aspect-video bg-gray-300" />
      <CardHeader>
        <CardTitle>
          <div className="w-3/4 h-6 rounded-full bg-gray-300" />
        </CardTitle>
        <CardDescription>
          <div className="w-1/2 h-4 rounded-full bg-gray-300" />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="w-full h-4 rounded-full bg-gray-300" />
        <div className="w-full h-4 rounded-full bg-gray-300" />
        <div className="w-3/4 h-4 rounded-full bg-gray-300" />
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button asChild size="lg" variant="default" className="w-full">
          <Link href="#">Loading...</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
