import Container from "@/components/Container";
import React from "react";
import CheckoutClient from './_components/CheckoutClient';

export default function CheckoutPage() {
  return (
    <div className="p-8">
      <Container>
        <div>
          <CheckoutClient />
        </div>
      </Container>
    </div>
  );
}
