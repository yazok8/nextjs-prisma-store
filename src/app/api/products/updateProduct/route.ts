// src/pages/api/products/update.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { updateProduct } from '@/app/admin/_actions/products';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  try {
    // Convert incoming request to FormData
    const formData = new FormData();
    for (const key in req.body) {
      formData.append(key, req.body[key]);
    }

    // Invoke the server action
    await updateProduct(id, formData);
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error: any) {
    res.status(400).json({ errors: error.message });
  }
}
