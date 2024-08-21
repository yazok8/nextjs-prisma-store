
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { z } from "zod";
import db from "@/db/db";



// Define a schema for user data validation using zod
const userSchema=z.object({
    name:z.string().min(1,'Name is required').max(100),
    email:z.string().min(1,'Email is required').email('Invalid email'),
    hashedPassword:z.string().min(1, 'Password is required')
    .min(8,'Password must have minimum 8 charecters'),
    confirmPassword:z.string().min(1,'Password confirmation is required')
})
// Custom validation to ensure passwords match
.refine((data)=>data.hashedPassword===data.confirmPassword,{
    path:['confirmPassword'],
    message:'Password do not match'
})


 export async function POST(req:Request){
    try{
        // Parse and validate the incoming request body using the userSchema
        const body = await req.json(); 
        const {name, email,hashedPassword} = userSchema.parse(body) 

        //check if email already exists
        const emailExists = await db.user.findUnique({where:{email:email}});
        if(emailExists){
             // If the email is already in use, return a conflict status with an error message
            return  NextResponse.json({user: null, message:"User with this email already exists"}, {status:409})
        }
        // Hash the password using SHA-256 and encode it in base64
        const password= await createHash('sha256').update('bacon').digest('base64');

        // Create a new user record in the database with the provided data
        const newUser = await db.user.create({
            data:{
                name,
                email,
                hashedPassword
                }
        });
        // Exclude the hashed password from the response to avoid exposing it
        const {hashedPassword: newUserPassword, ...rest}= newUser
        // Return a success response with the new user's data (excluding the password)
        return NextResponse.json({user:rest, message:"User created successfully "}, {status:201});

    }catch(err){
        // If any error occurs, return an internal server error status with a generic error message
        return NextResponse.json({message:"Something went wrong"}, {status:500});

    }
}
