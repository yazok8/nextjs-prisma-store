// src/app/user/sign-up/page.tsx

"use client";

import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must have minimum 8 characters"),
});

type SignUpFormValues = z.infer<typeof formSchema>;

export default function UserSignUp() {
  const { toast } = useToast();
  const router = useRouter();
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignUpFormValues) {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Account created successfully",
        });
        router.push("/user/sign-in");
      } else {
        toast({
          title: "Error",
          description: data.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-5">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="sign-up-form">
          <div className="mb-4">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              {...register("name")}
              placeholder="Enter your name"
            />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>

          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          </div>

          <div className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500">{errors.password.message}</p>}
          </div>

          <div className="mt-4">
            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </div>
        </form>
        <p className="text-sm my-3">
          Already have an account?{" "}
          <a
            className="text-blue-700 cursor-pointer"
            onClick={() => router.push("/user/sign-in")}
          >
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}
