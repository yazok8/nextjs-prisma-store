// components/CartItem.tsx

"use client";

import React from 'react';
import { CartProductType } from '../../products/[id]/purchase/_components/ProductDetails';
import { formatCurrency } from '@/lib/formatters';
import Link from 'next/link';
import Image from 'next/image';
import SetQuantity from '../../products/_components/SetQuantity';
import { useCart } from '@/app/webhooks/useCart/CartContext';
import { getImageSrc } from '@/lib/imageHelper';

interface CartItemProps {
  item: CartProductType;
}

export default function CartItem({ item }: CartItemProps) {
  const { handleRemoveCartProduct, handleCartQuantityIncrease, handleCartQuantityDecrease } = useCart();

  const totalPrice = (item.priceInCents * item.Quantity) / 100;

  const formattedTotalCurrency = formatCurrency(totalPrice);

  return (
    <div className='grid grid-cols-5 text-xs md:text-sm gap-4 border-slate-200 py-4 items-center'>
      <div className='col-span-2 justify-self-start flex gap-2 md:gap-4'>
        <Link href={`/products/${item.id}`}>
          <div className="relative w-[150px] pt-[70%]">
            <Image src={getImageSrc(item.imagePath)} alt={item.name} fill className='object-contain' />
          </div>
        </Link>

        <div className='flex flex-col justify-between'>
          <div className="line-clamp-3">
          <Link href={`/products/${item.id}`}>
            {item.name}
          </Link>
          </div>
          <div className='w-[70px]'>
            <button
              className='text-slate-500 underline'
              onClick={() => { handleRemoveCartProduct(item); }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      <div className='justify-self-center'>{formatCurrency(item.priceInCents / 100)}</div>
      <div className='justify-self-center'>
        <SetQuantity
          cartCounter={true}
          cartProduct={item}
          handleCartQuantityIncrease={() => { handleCartQuantityIncrease(item); }}
          handleCartQuantityDecrease={() => { handleCartQuantityDecrease(item); }}
        />
      </div>
      <div className='justify-self-end'>
        {formattedTotalCurrency}
      </div>
    </div>
  );
}
