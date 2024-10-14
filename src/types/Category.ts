// types/Category.ts

export interface Category {
    id: string
    name: string
  }
  
  export interface ProductFormErrors {
    name?: string[];
    priceInCents?: string[];
    description?: string[];
    image?: string[];
    categoryId?: string[]; // Ensure this property exists
  }