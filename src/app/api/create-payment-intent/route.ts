import { getCurrentUser } from "@/app/(customerFacing)/_actions/user";
import { CartProductType } from "@/app/(customerFacing)/products/[id]/purchase/_components/ProductDetails";
import db from "@/db/db";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string,{
    apiVersion: "2024-04-10"
}); 

const calculateOrderAmount = (items:CartProductType[])=>{
    const totalPrice = items.reduce((acc, item)=>{
        const itemTotal = item.priceInCents * item.Quantity;
        return acc + itemTotal
    },0)
    return totalPrice;
}

export async function POST(req:Request){
    const currentUser = await getCurrentUser(); 

    if(!currentUser){
        NextResponse.json({error:"Unauthorized"})
    }

    const body = await req.json()

    const {items, payment_intent_id} = body

    const total = calculateOrderAmount(items) / 100;
    
    const orderData = {
        user: { connect: { id: currentUser?.id } },
        pricePaidInCents: total,
        currency: "usd",
        status: "pending",
        deliveryStatus: "pending",
        paymentIntentId: payment_intent_id,
        product: {
          connect: { id: items[0].productId },  // Assuming items have a productId field
        },
        products: {
          create: items.map((item:CartProductType) => ({
            product: { connect: { id: item.id } },  // Assuming items have a productId
            quantity: item.Quantity,  // Assuming items have a quantity field
            price: item.priceInCents,  // Assuming items have a priceInCents field
          })),
        },
      };
      
    
    if(payment_intent_id){
        //update the order
        const current_intent = await stripe.paymentIntents.retrieve(payment_intent_id)
        if(current_intent){
            const updated_intent = await stripe.paymentIntents.update(payment_intent_id, 
                {amount:total}
            )

            const [existing_order, update_order] = await Promise.all([
                db.order.findFirst({
                    where:{paymentIntentId:payment_intent_id}
                }), 
                db.order.update({
                    where:{paymentIntentId:payment_intent_id}, 
                    data:{
                        pricePaidInCents:total, 
                        products:items
                    }
                })
            ])
    
            if(!existing_order){
                return NextResponse.json({error: "Invalid Payment Intent"}, {status:400})
            }
            return NextResponse.json({paymentIntent:updated_intent})
        }

    }else{
        //create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount:total, 
            currency:"usd", 
            automatic_payment_methods:{enabled:true},
        })
        // create the order
        orderData.paymentIntentId = paymentIntent.id
        await db.order.create({
            data: orderData
        })
        return NextResponse.json({paymentIntent})
    }


}