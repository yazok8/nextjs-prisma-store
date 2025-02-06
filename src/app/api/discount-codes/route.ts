import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function GET(req:NextApiRequest, res:NextApiResponse){
    try{
        const discountCodes = await prisma.discountCode.findMany({
            include:{
                _count:{
                    select:{orders: true},
                },
            },
            orderBy:{
                createdAt:'desc',
            }
        });
        return res.status(200).json(discountCodes)
    }catch(error){
        console.log(error);
        res.status(500).json({error:'Internal Server Error'});
    }
}