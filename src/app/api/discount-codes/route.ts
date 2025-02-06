import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const discountCodes = await prisma.discountCode.findMany({
            include: {
                _count: {
                    select: { orders: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            }
        });
        return NextResponse.json(discountCodes);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}