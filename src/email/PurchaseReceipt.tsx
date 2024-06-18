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
  product: {
    name: string;
    imagePath:string
    description:string
  };
  order: {
    id: string;
    createdAt: Date;
    pricePaidInCents: number;
  };
  downloadVerificationId:string
};

PurchaseReceiptEmail.PreviewProps = {
  product: { name: "Product name",imagePath:"/products/90ddc519-9ddc-4991-91f1-3b31d07b995d-treeoflife2.jpg", description:"some description"},
  order: { 
    id:crypto.randomUUID(), 
    createdAt:new Date(),
    pricePaidInCents:10000,
    },
    downloadVerificationId:crypto.randomUUID()
} satisfies PurchaseReceiptEmailProps;

export default function PurchaseReceiptEmail({
  product,
  order,
  downloadVerificationId
}: PurchaseReceiptEmailProps) {
  return (
    <Html>
      <Preview>Download {product.name} and view receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container>
            <Heading>Purchase Receipt</Heading>
            <OrderInformation order={order} product={product} downloadVerificationId={downloadVerificationId}/>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
