// src/app/api/categories/[id]/route.ts

import db from '@/db/db';
import { NextRequest, NextResponse } from 'next/server';

// DELETE /api/categories/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
  }

  try {
    // Check if any products are associated with this category
    const associatedProducts = await db.product.findFirst({
      where: { categoryId: id },
    });

    if (associatedProducts) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated products.' },
        { status: 400 }
      );
    }

    // Attempt to delete the category
    const deletedCategory = await db.category.delete({
      where: { id },
    });

    if (!deletedCategory) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
