"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteUser } from "../../_actions/users";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function DeleteDropDownItem({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await startTransition(async () => {
        await deleteUser(id);
        router.refresh();
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error during delete operation:", error.message, error.stack);
        alert("Failed to delete the user. Please try again later.");
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    }
  };  

  return (
    <DropdownMenuItem variant="destructive" onClick={handleDelete}>
      Delete
    </DropdownMenuItem>
  );
}
