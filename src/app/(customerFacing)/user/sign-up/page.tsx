"use client"

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {useToast } from "@/components/ui/use-toast";

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    hashedPassword: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must have minimum 8 charecters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  // Custom validation to ensure passwords match
  .refine((data) => data.hashedPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password do not match",
  });

  // TypeScript interface for form values based on the schema
type SignUpFormValues = z.infer<typeof formSchema>;

export default function SignUp() {
  const {toast} = useToast();
    const router=useRouter();
    const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormValues>({
        resolver: zodResolver(formSchema),
    });
    

  async function onSubmit(data: SignUpFormValues) {

    const lowercasedEmail = data.email.toLowerCase();
    try{
        const response = await fetch("/admin/auth/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          body: JSON.stringify({
              name: data.name,
              email: lowercasedEmail,
              hashedPassword: data.hashedPassword,
              confirmPassword: data.confirmPassword,
            }),
          });
          if (response.ok) {
            // Redirect user to sign-in page after successful registration
            router.refresh();
            router.push("/user/sign-in");
          }else{
            toast({
              title: "Error",
              description: "Oops! something went wrong",
              variant:"destructive"
            })
    }
        
    }catch(err){
        console.error('Failed to sign up:', err);
        alert('Failed to sign up');
    }
  }
  return(
    <div className="flex items-center justify-center min-h-[85vh] overflow-y-hidden">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
    <form onSubmit={handleSubmit(onSubmit)} className="sign-up-form">
    <div className="max-w-xl">
        <Label htmlFor="name">Name</Label>
        <Input
            id="name"
            type="text"
            {...register('name')}
            placeholder="Enter your name"
        />
        {errors.name && <p>{errors.name.message}</p>}
    </div>

    <div className="max-w-xl">
        <Label htmlFor="email">Email</Label>
        <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="Enter your email"
        />
        {errors.email && <p>{errors.email.message}</p>}
    </div>

    <div className="max-w-xl">
        <Label htmlFor="hashedPassword">Password</Label>
        <Input
            id="hashedPassword"
            type="password"
            {...register('hashedPassword')}
            placeholder="Enter your password"
        />
        {errors.hashedPassword && <p>{errors.hashedPassword.message}</p>}
    </div>

    <div className="max-w-xl">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            placeholder="Confirm your password"
        />
        {errors.confirmPassword && <p>{errors.confirmPassword.message}</p>}
    </div>

    <Button className="mt-4" type="submit">Sign Up</Button>
</form>
</div>
</div>

  )
}
