"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  trigger: React.ReactNode;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  trigger,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#141516] border border-[#23252a]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#f7f8f8]">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-[#d0d6e0]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-[#0f1011] border border-[#23252a] text-[#8a8f98] hover:bg-[#141516] hover:text-[#f7f8f8]">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            className={
              variant === "destructive"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-[#5e6ad2] text-white hover:bg-[#828fff]"
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}