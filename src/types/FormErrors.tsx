export interface FieldErrors {
    name?: string[];
    description?: string[];
    priceInCents?: string[];
    image?: string[];
    categoryId?: string[];
  }
  
  export interface GeneralErrors {
    general: string[];
  }
  
  export type FormErrors = FieldErrors | GeneralErrors;