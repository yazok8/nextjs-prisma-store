import { getMostNewestProducts } from '@/actions/categories';
import dynamic from 'next/dynamic'
import React from 'react'


const HomepageSlider = dynamic(() => import('@/app/(customerFacing)/newhomepage/_components/HomepageSlider'));




export default async function NewHomepage() {
  const products = await getMostNewestProducts();
  return (
    <HomepageSlider products={products} />
  )
}
