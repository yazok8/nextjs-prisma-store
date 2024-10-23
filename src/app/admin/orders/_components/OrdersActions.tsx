"use client";

import { useRouter } from "next/navigation";

import { useTransition } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteOrder } from "../../_actions/orders";

export function DeleteDropDownItem({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <DropdownMenuItem
      variant="destructive"
      onClick={() => {
        startTransition(async () => {
          await deleteOrder(id);
          router.refresh();
        });
      }}
    >
      Delete
    </DropdownMenuItem>
  );
}
