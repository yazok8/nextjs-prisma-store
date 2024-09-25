import {
  Body,
  Html,
  Preview,
  Tailwind,
  Head,
  Container,
  Heading,
} from "@react-email/components";
import OrderInformation from "./components/OrderInformation";
import crypto from "crypto"

type PurchaseReceiptEmailProps = {
  orders: {
    order: {
      id: string;
      pricePaidInCents: number;
      createdAt: Date;
    };
    product: {
      name: string;
      imagePath: string;
      description: string;
    };
    downloadVerificationId: string;  // This will receive the value of 'downloadVerification.id'
  }[];
};

export default function PurchaseReceiptEmail({ orders }: PurchaseReceiptEmailProps) {
  return (
    <Html>
      <Preview>Your Purchase Receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container>
            <Heading>Thank you for your purchase!</Heading>
            {orders.map(({ order, product, downloadVerificationId }) => (
              <div key={order.id}>
                <OrderInformation
                  order={order}
                  product={product}
                  downloadVerificationId={downloadVerificationId}  // Use it here as well
                />
              </div>
            ))}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}


