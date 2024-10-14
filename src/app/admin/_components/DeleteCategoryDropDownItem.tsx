// src/app/admin/_components/DeleteCategoryDropDownItem.tsx

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Trash } from 'lucide-react';
import { useState } from 'react';

type DeleteCategoryDropDownItemProps = {
  id: string;
  disabled?: boolean;
};

export function DeleteCategoryDropDownItem({ id, disabled = false }: DeleteCategoryDropDownItemProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = async () => {
    const confirmDeletion = window.confirm('Are you sure you want to delete this category? This action cannot be undone.');
    if (!confirmDeletion) return;

    startTransition(async () => {
      try {
        const response = await fetch(`/api/products/categories/${id}`, { // Updated URL
          method: 'DELETE',
        });

        const result = await response.json();

        if (!response.ok) {
          console.error(result.error);
          alert(result.error);
          return;
        }

        alert(result.message);
        router.refresh();
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category. Please try again.');
      }
    });
  };

  return (
    <DropdownMenuItem
      variant='destructive'
      disabled={disabled || isPending}
      onClick={handleDelete}
    >
      <Trash className="mr-2 h-4 w-4" />
      Delete Category
    </DropdownMenuItem>
  );
}
