"use client"

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Category } from '@/types/Category';

interface CategoryFormInputs {
    name: string
  }
  
  const categorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
  })

export default function Categories() {
    
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
      } = useForm<CategoryFormInputs>({
        resolver: zodResolver(categorySchema),
      })

      const [categories, setCategories] = useState<Category[]>([])

      const onSubmit = async (data:CategoryFormInputs)=>{
        try {
            const response = await fetch("/api/categories",{
                method:"POST", 
                headers:{
                    "Content-Type": "application/json",
                },
            body: JSON.stringify(data)
            })
            if(!response.ok){
                const resData = await response.json()
                throw new Error(resData.error || "failed to add category")
            }
            const newCategory = await response.json()
            setCategories([...categories,newCategory.name])
            reset()
        }catch (error) {
            console.error(error)
          }
    }

    useEffect(() => {
        // Fetch categories from the API
        const fetchCategories = async () => {
          try {
            const response = await fetch('/api/categories');
            if (!response.ok) {
              throw new Error('Failed to fetch categories');
            }
            const data: Category[] = await response.json();
            setCategories(data);
          } catch (err) {
            console.error(err);
          }
        };
    
        fetchCategories();
      }, []);
 
    return (
        
        <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Manage Categories</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-destructive">{errors.name.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Category"}
          </Button>
        </form>
  
        <h2 className="text-xl font-semibold mt-8">Existing Categories</h2>
        <ul className="list-disc list-inside">
          {categories.map((category, index) => (
            <li key={index}>{category.name}</li>
          ))}
        </ul>
      </div>


  )
}
