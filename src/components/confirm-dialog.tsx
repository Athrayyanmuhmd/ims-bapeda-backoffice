"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/modal";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Hapus data?",
  description = "Tindakan ini tidak dapat dibatalkan.",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onConfirm} isLoading={isLoading} disabled={isLoading}>
            Hapus
          </Button>
        </>
      }
    />
  );
}
