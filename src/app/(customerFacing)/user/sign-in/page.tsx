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

const formSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  hashedPassword: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must have minimum 8 charecters"),
});

type SignInFormValues = z.infer<typeof formSchema>;

export default function Login() {
  const { toast } = useToast();
  const router = useRouter();
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      hashedPassword: "",
    },
  });

  async function onSubmit(values: SignInFormValues) {
    const callbackUrl = "/"; // Or a specific URL where you want to redirect
    const signinCreds = await signIn("credentials", {
      email: values.email,
      password: values.hashedPassword,
      redirect: false,
      callbackUrl, // Pass only the final desired callbackUrl
    });

    if (signinCreds?.error) {
      toast({
        title: "Error",
        description: "Oops! something went wrong",
        variant: "destructive",
      });
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  async function SignUp() {
    router.push("/user/sign-up");
  }

  return (
    <div className="flex items-center justify-center min-h-[85vh] overflow-hidden p-5">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="sign-up-form">
          <div className="max-w-sm">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")} // Register the email input
              placeholder="Enter your email"
            />

            {errors.email && <p>{errors.email.message}</p>}
          </div>

          <div className="max-w-sm">
            <Label htmlFor="hashedPassword">Password</Label>
            <Input
              id="hashedPassword"
              type="password"
              {...register("hashedPassword")}
              placeholder="Enter your password"
            />
            {errors.hashedPassword && <p>{errors.hashedPassword.message}</p>}
          </div>
          <div className="mt-4">
            <Button type="submit">Sign in</Button>
          </div>
        </form>
        <p className="text-sm my-3">
          If you don&apos;t have an account, please{" "}
          <a
            className="text-blue-700 cursor-pointer text-sm"
            onClick={() => SignUp()}
            type="submit"
          >
            Click here
          </a>{" "}
          to sign up
        </p>
      </div>
    </div>
  );
}
