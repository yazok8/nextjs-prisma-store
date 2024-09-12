"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emailOrderHistory } from "@/actions/orders";
import { useToast } from "@/components/ui/use-toast";

type FormResultType = {
  message?: string;
  error?: string;
};

export default function MyOrdersPage() {
  const [formResult, setFormResult] = useState<FormResultType | null>(null);
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  // Handle form submission manually
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    const formData = new FormData(event.currentTarget);
    
    // Call emailOrderHistory function
    const result = await emailOrderHistory(null, formData);
    
    // Set form result
    setFormResult(result);
    setPending(false);

    if (result?.message) {
      toast({
        title: "Order sent",
        description: result.message,
      });

      // Reload the page
      setTimeout(()=>{
        window.location.reload();
      },4000)
    }else if(result?.error){
      toast({
        title: "Order sent",
        description: "Email delivery is only available to Resend Email API service subscriber in test mode."
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-2-xl mx-auto">
      <Card>
        <CardHeader className="px-6">
          <CardTitle>My Orders</CardTitle>
          <CardDescription>
            Enter your email and we will email you your order history and download links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input type="email" required name="email" id="email" />
            {formResult?.error && <div className="text-destructive">{formResult.error}</div>}
          </div>
        </CardContent>
        <CardFooter>
          {formResult?.message ? (
            <p>{formResult.message}</p>
          ) : (
            <SubmitButton pending={pending} />
          )}
        </CardFooter>
      </Card>
    </form>
  );
}

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button className="w-full" size="lg" disabled={pending} type="submit">
      {pending ? "Sending..." : "Send"}
    </Button>
  );
}
