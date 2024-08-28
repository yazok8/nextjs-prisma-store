"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { updateUser } from "../../_actions/user";

interface UserFormProps {
  user: User
}

export function UserForm({ user }: UserFormProps) {
  const router = useRouter();
  
  const [name, setName] = useState<string>(user?.name ?? "");
  const [email, setEmail] = useState<string | undefined>(user?.email ?? "");
  const [address, setAddress] = useState<string>(user?.address ?? "");

  // Define the form action function
  // const formAction = async (state: {
  //   name?: string[];
  //   email?: string[];
  //   address?: string[];
  //   profileImage?: string[];
  // }) => {
  //   if (user) {
  //     const formData = new FormData();

  //     await updateUser(user.id, state, formData);
  //   }
  //   return state;
  // };


  
  
  // Call useFormState unconditionally
  const [error, action] = useFormState(updateUser.bind(null,user.id), {});


  return (
    <form action={action} className="space-y-8">
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
          Address
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
        {user != null && (
          <Image
            className="text-muted-foregorund"
            src={user.profileImage ?? "/default-avatar.png"}
            height={200}
            width={200}
            alt="User Image"
          />
        )}
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </>
  );
}
