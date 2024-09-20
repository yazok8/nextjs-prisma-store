"use server"

import db from "@/db/db";
import { z } from "zod";
import { Resend } from 'resend';
import OrderHistoryEmail from "@/email/OrderHistory";
import { getDiscountedAmount, usableDiscountCodeWhere } from "@/lib/discountCodeHelper";
import Stripe from "stripe";

const emailShema=z.string().email()
const resend = new Resend(process.env.RESEND_API_KEY as string);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export async function emailOrderHistory(prevState:unknown, formData:FormData):Promise<{message?:string; error?:string}>{
    const result = emailShema.safeParse(formData.get("email"));

    if(result.success==false){
        return {error:"Invalid email address"}
    }

    const user = await db.user.findUnique({where:{email:result.data}, select:{
        email:true,
        orders:{
            select:{
                pricePaidInCents:true, 
                id:true,
                createdAt:true, 
                product:{
                    select:{
                        id:true,
                        name:true, 
                        imagePath:true, 
                        description:true
                    }
                }
            }
        }
    }
});

    if(user==null) {
        return { 
        message:"Check your email to view your order history"
    }
}
    
 const orders = user.orders.map(async order=>{
    return {...order, downloadVerificationId: 
        (await db.downloadVerification.create({data:{expiresAt: 
            new Date(Date.now() + 24 * 1000 * 60 * 60),
             productId:order.product.id}})).id}
 })
 
    const data = await resend.emails.send({
        from:`Support<${process.env.SENDER_EMAIL}>`,
        to: user.email,
        subject:"Order History",
        react: <OrderHistoryEmail orders={await Promise.all(orders)} />
    })

    if(data.error){
        return {error:"There was an error sending your email. Please try again "}
    }

    return { message: "Check your email to view your order history" }
}

export async function createPaymentIntent(
    email: string,
    productId?: string, // Make this optional for single product checkouts
    discountCodeId?: string,
    cart?: { id: string; priceInCents: number; quantity: number }[] // Cart for multi-product checkout
  ) {
    let amount = 0;
  
    // Handle single-product checkout
    if (productId) {
      const product = await db.product.findUnique({ where: { id: productId } });
      
      if (!product) {
        return { error: "Product not found" };
      }
  
      const discountCode = discountCodeId
        ? await db.discountCode.findUnique({
            where: { id: discountCodeId, ...usableDiscountCodeWhere(product.id) },
          })
        : null;
  
      if (discountCodeId && !discountCode) {
        return { error: "Coupon has expired or is invalid" };
      }
  
      const existingOrder = await db.order.findFirst({
        where: { user: { email }, productId },
        select: { id: true },
      });
  
      if (existingOrder) {
        return {
          error: "You have already purchased this product. Try downloading it from the My Orders page",
        };
      }
  
      amount = discountCode
        ? getDiscountedAmount(discountCode, product.priceInCents)
        : product.priceInCents;
    }
  
    // Handle cart checkout
    if (cart && cart.length > 0) {
      for (const cartItem of cart) {
        const product = await db.product.findUnique({ where: { id: cartItem.id } });
        if (!product) return { error: `Product with ID ${cartItem.id} not found` };
  
        const existingOrder = await db.order.findFirst({
          where: { user: { email }, productId: cartItem.id },
          select: { id: true },
        });
  
        if (existingOrder) {
          return {
            error: `You have already purchased the product with ID ${cartItem.id}. Please check your orders.`,
          };
        }
  
        // Add product price to total (multiplied by quantity)
        amount += cartItem.priceInCents * cartItem.quantity;
      }
    }
  
    // Create the payment intent for the total amount (single product or cart)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      metadata: {
        productId: productId || null,
        cart: cart ? JSON.stringify(cart.map(item => ({ id: item.id, quantity: item.quantity }))) : null,
        discountCodeId: discountCodeId || null,
      },
    });
  
    if (!paymentIntent.client_secret) {
      return { error: "Unknown error occurred" };
    }
  
    return { clientSecret: paymentIntent.client_secret };
  }
  