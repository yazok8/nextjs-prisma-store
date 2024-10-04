"use client";

import { useCart } from '@/app/webhooks/useCart';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useToast } from '@/components/ui/use-toast';
import { CircleXIcon } from 'lucide-react';

export default function CheckoutClient() {
  const {cartProducts, paymentIntent, handleSetPaymentIntent} = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  
  const router = useRouter();
  const { toast } = useToast();

  console.log("paymentIntent:", paymentIntent);
  console.log("clientSecret:", clientSecret);

  useEffect(()=>{
    if(cartProducts){
      setIsLoading(true); 
      setError(false)

      fetch('/api/create-payment-intent', {
        method:'POST', 
        headers: {'Content-Type':'applicaton/json'},
        body: JSON.stringify({
          items:cartProducts, 
          payment_intent_id:paymentIntent
        })
      }).then((res)=>{setIsLoading(false)
        if(res.status===401){
          return router.push('/login')
        }
        return res.json(); 
      }).then((data)=>{
        setClientSecret(data.paymentIntent.client_secret);
        handleSetPaymentIntent(data.paymenetItent.id)
      }).catch((error)=>{
        console.log("Error", error);
        toast({
          title: (
            <div className="flex items-center">
              <CircleXIcon className="mr-2" />
              <span className="first-letter:capitalize">
                Something went wrong!
              </span>
            </div>
          ),
        });
        
      })

    }
  },[cartProducts, paymentIntent])

  return (
    <div>Checkout</div>
  )
}
