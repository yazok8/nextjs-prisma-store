// src/app/admin/products/ProductForm.tsx

"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getImageSrc } from "@/lib/imageHelper";
import { SubmitButton } from "@/components/SubmitButton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import defaultAvatar from "../../../../../public/default-avatar.png"

interface UserFormProps {
  user: User;
}

// Type Guards for Error Handling
const isGeneralError = (errors: any): errors is { general: string[] } => {
  return errors && typeof errors === "object" && "general" in errors;
};

const isFieldError = (errors: any): errors is Record<string, string[]> => {
  return errors && typeof errors === "object" && !isGeneralError(errors);
};

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();

  const [name, setName] = useState<string>(user?.name ?? "");
  const [email, setEmail] = useState<string | undefined>(user?.email ?? "");
  const [address, setAddress] = useState<string>(user?.address ?? "");
  const [currentImageSrc, setCurrentImageSrc] = useState<string>("");
  const [error, setError] = useState<any>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(
        `/api/user/updateProfile?id=${user.id}`, // Corrected route path
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle field-specific errors
        if (typeof data.errors === "object") {
          setError(data.errors);
        } else {
          throw new Error(data.errors || "Something went wrong");
        }
      } else {
        setSuccess(data.message);
        // Redirect to the user page
        window.location.href = "/user";
      }
    } catch (err: any) {
      setError({ general: [err.message] });
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const imageSrc = getImageSrc(user?.profileImage);
    setCurrentImageSrc(imageSrc);
  }, [user]);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
      <div className="space-y-2">
        <Label htmlFor="name" className="text-lg">
          Name
        </Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error?.name && <div className="text-destructive">{error.name}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-lg">
          Email
        </Label>
        <Input
          type="email"
          id="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error?.email && <div className="text-destructive">{error.email}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="address" className="text-lg">
          Delivery Address
        </Label>
        <Textarea
          id="address"
          name="address"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        {error?.address && (
          <div className="text-destructive">{error.address}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="image" className="text-lg">
          Image
        </Label>
        <Input type="file" id="image" name="image" required={user == null} />
        {user != null && currentImageSrc !== '' && (
          <Image
            src={currentImageSrc!}
            height={400}
            width={400}
            alt="User Image"
            onError={(e) => {
              // Fallback to default image if S3 image fails to load
              setCurrentImageSrc("/default-avatar.png"); // Ensure this image exists in public/
            }}
          />
        )}
      </div>
      <SubmitButton />
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
