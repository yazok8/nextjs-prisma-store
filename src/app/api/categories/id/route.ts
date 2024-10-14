import React from 'react'
import { NextRequest, NextResponse } from 'next/server';
import db from '@/db/db';

export async function route(req:NextRequest,params:{id:string}) {
    const {id}=params; 

    if(!id){
        return NextResponse.json({error: "Category ID is required"},{status:400})
    }

    try{
    
        const relatedProducts = await db.product.findMany({
            where:{categoryId:id}, 
            select:{id:true}
        }); 
        if(relatedProducts.length>0){
            return NextResponse.json({
                error:"Cannot delete category with associated products"
            }, 
        {status:400})
        }

        const deleteCategory = await db.category.delete({
            where:{id}
        })
    return NextResponse.json(deleteCategory, {status:200})
    }catch(error:any){
        console.log("Error deleting category:", error);
        // Prisma error code for "An operation failed because it depends on one or more records that were required but not found."
        if(error.code === "P2025"){
            return NextResponse.json({ error: 'Category not found.' }, { status: 404 });

        }
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }

}
