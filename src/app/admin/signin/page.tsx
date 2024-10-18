// pages/admin/signin.tsx

"use client";

import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

const adminFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have minimum 8 characters"),
  isAdmin: z.literal("true"), // Ensure isAdmin is always "true" for admin sign-in
});

type SignInFormValues = z.infer<typeof adminFormSchema>;

export default function AdminSignIn() {
  const { toast } = useToast();
  const router = useRouter();
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<SignInFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      email: "",
      password: "",
      isAdmin: "true", // Set default value to "true"
    },
  });

  async function onSubmit(values: SignInFormValues) {
    const callbackUrl = "/admin"; // Redirect to admin dashboard after sign-in
    const signinCreds = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl,
      isAdmin: values.isAdmin, // Pass 'isAdmin' as part of the credentials
    });

    if (signinCreds?.error) {
      toast({
        title: "Error",
        description: "Invalid email or password, or you do not have admin access.",
        variant: "destructive",
      });
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  async function navigateToUserSignIn() {
    router.push("/user/sign-in");
  }

  return (
    <div className="flex items-center justify-center min-h-[85vh] overflow-hidden p-5">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="sign-in-form">
          <div className="max-w-sm">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter your admin email"
            />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="max-w-sm">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Hidden field to indicate admin sign-in */}
          <input type="hidden" value="true" {...register("isAdmin")} />

          <div className="mt-4">
            <Button type="submit">Admin Sign in</Button>
          </div>
        </form>
        <p className="text-sm my-3">
          Not an admin?{" "}
          <a
            className="text-blue-700 cursor-pointer text-sm"
            onClick={() => navigateToUserSignIn()}
          >
            Sign in as User
          </a>
        </p>
      </div>
    </div>
  );
}
