// src/app/user/sign-in/page.tsx

"use client";

import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have minimum 8 characters"),
});

type SignInFormValues = z.infer<typeof formSchema>;

export default function SignIn() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();

  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [session, status, router]);

  async function onSubmit(values: SignInFormValues) {
    try {
      const result = await signIn("credentials", {
        redirect: false, // Prevent automatic redirection
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        toast({
          title: "There was a problem",
          description: "Your password is incorrect",
          variant: "destructive",
        });
      }
      // If no error, the useEffect will handle the redirect based on session
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Error",
        description: "Oops! something went wrong",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-5">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="sign-in-form">
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter your email"
              className="mt-1 block w-full"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Enter your password"
              className="mt-1 block w-full"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="mt-4">
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </div>
        </form>
        <p className="text-sm my-3 text-center">
          Don&apos;t have an account?{" "}
          <span
            className="text-blue-700 cursor-pointer text-sm underline"
            onClick={() => router.push("/user/sign-up")}
          >
            Sign up here
          </span>
        </p>
      </div>
    </div>
  );
}
