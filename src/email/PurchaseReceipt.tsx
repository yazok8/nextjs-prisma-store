// /src/email/PurchaseReceipt.tsx

import React from 'react';

type PurchaseReceiptEmailProps = {
  order: {
    id: string;
    pricePaidInCents: number;
    createdAt: Date;
    // ...other order fields
  };
  product: {
    id: string;
    name: string;
    imagePath: string;
    description: string;
    // ...other product fields
  };
  downloadVerificationId: string; // Added this prop
};

const PurchaseReceiptEmail: React.FC<PurchaseReceiptEmailProps> = ({
  order,
  product,
  downloadVerificationId,
}) => {
  return (
    <html>
      <body>
        <h1>Thank you for your purchase!</h1>
        <p>Order ID: {order.id}</p>
        <p>Product: {product.name}</p>
        <p>Amount Paid: ${(order.pricePaidInCents / 100).toFixed(2)}</p>
        <p>Order Date: {order.createdAt.toDateString()}</p>
        <p>
          <a href={`https://yourdomain.com/download/${downloadVerificationId}`}>
            Download Your Product
          </a>
        </p>
      </body>
    </html>
  );
};

export default PurchaseReceiptEmail;
