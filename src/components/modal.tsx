// src/components/modal.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils/classname";

export interface IModalRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: () => boolean;
}

// Controlled props
interface ControlledModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Uncontrolled props
interface UncontrolledModalProps {
  open?: never;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

type ModalProps = {
  ref?: React.Ref<IModalRef>;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
} & (ControlledModalProps | UncontrolledModalProps);

export function Modal({
  ref,
  title,
  description,
  children,
  footer,
  className,
  overlayClassName,
  ...props
}: ModalProps) {
  // Determine if controlled or uncontrolled
  const isControlled = "open" in props && props.open !== undefined;

  const [internalOpen, setInternalOpen] = React.useState(
    !isControlled ? ((props as UncontrolledModalProps).defaultOpen ?? false) : false
  );

  const open = isControlled ? (props as ControlledModalProps).open : internalOpen;

  const handleOpenChange = (value: boolean) => {
    if (!isControlled) {
      setInternalOpen(value);
    }
    props.onOpenChange?.(value);
  };

  // Expose imperative handle
  React.useImperativeHandle(
    ref,
    () => ({
      open: () => handleOpenChange(true),
      close: () => handleOpenChange(false),
      toggle: () => handleOpenChange(!open),
      isOpen: () => open,
    }),
    [open]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={cn("max-h-[85vh] overflow-y-auto", className)}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {/* Radix requires a description for aria-describedby even when there's nothing to show */}
            <DialogDescription className={description ? undefined : "sr-only"}>
              {description ?? title}
            </DialogDescription>
          </DialogHeader>
        )}

        <div className="py-2">{children}</div>

        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
