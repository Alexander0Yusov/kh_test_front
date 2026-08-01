"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode, RefObject } from "react";

interface DialogProps {
  children: ReactNode;
  closeDisabled?: boolean;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  title: string;
}

export function Dialog({
  children,
  closeDisabled = false,
  onOpenChange,
  open,
  returnFocusRef,
  title,
}: DialogProps) {
  return (
    <DialogPrimitive.Root
      onOpenChange={(nextOpen) => {
        if (nextOpen || !closeDisabled) onOpenChange(nextOpen);
      }}
      open={open}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dialog-overlay">
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="dialog-content"
            onEscapeKeyDown={(event) => {
              if (closeDisabled) event.preventDefault();
            }}
            onInteractOutside={(event) => {
              if (closeDisabled) event.preventDefault();
            }}
            onCloseAutoFocus={(event) => {
              if (returnFocusRef?.current) {
                event.preventDefault();
                returnFocusRef.current.focus();
              }
            }}
          >
            <div className="dialog-header">
              <DialogPrimitive.Title className="dialog-title">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <button
                  aria-label="Close dialog"
                  className="dialog-close"
                  disabled={closeDisabled}
                  type="button"
                >
                  <X aria-hidden="true" size={16} />
                </button>
              </DialogPrimitive.Close>
            </div>
            {children}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
