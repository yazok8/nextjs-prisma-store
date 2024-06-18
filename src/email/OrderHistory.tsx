import {
    Body,
    Html,
    Preview,
    Tailwind,
    Head,
    Container,
    Heading,
    Hr,
  } from "@react-email/components";
  import OrderInformation from "./components/OrderInformation";
  import crypto from "crypto"
import React from "react";
  
  type OrderHistoryEmailProps = {
    orders:{
        id:string
        pricePaidInCents: number
        createdAt: Date
        downloadVerificationId: string
        product: {
            name: string;
            imagePath:string
            description:string
          };
    }[]
  };
  
  OrderHistoryEmail.PreviewProps = {
    orders:[
        {
            id:crypto.randomUUID(), 
            createdAt:new Date(), 
            pricePaidInCents: 1000,
            downloadVerificationId:crypto.randomUUID(),
            product: { name: "Product name",imagePath:"/products/90ddc519-9ddc-4991-91f1-3b31d07b995d-treeoflife2.jpg", description:"some description"},

        },
        {
            id:crypto.randomUUID(), 
            createdAt:new Date(), 
            pricePaidInCents: 2000,
            downloadVerificationId:crypto.randomUUID(),
            product: { name: "Product name",imagePath:"/products/90ddc519-9ddc-4991-91f1-3b31d07b995d-treeoflife2.jpg", description:"some other description"},

        }
    ]
  } satisfies OrderHistoryEmailProps;
  
  export default function OrderHistoryEmail({
orders
  }: OrderHistoryEmailProps) {
    return (
      <Html>
        <Preview>Order History & Downloads</Preview>
        <Tailwind>
          <Head />
          <Body className="font-sans bg-white">
            <Container>
              <Heading>Order History</Heading>
              {orders.map((order,index) =>(
                <React.Fragment  key={order.id} >
                <OrderInformation order={order} product={order.product} downloadVerificationId={order.downloadVerificationId} />
                {index<orders.length - 1 && <Hr /> }
                </React.Fragment>
              ))}

            </Container>
          </Body>
        </Tailwind>
      </Html>
    );
  }
  