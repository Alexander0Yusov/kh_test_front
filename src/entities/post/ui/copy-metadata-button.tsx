"use client";

import { Copy } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

interface CopyMetadataButtonProps {
  accessibleLabel: string;
  successMessage: string;
  value: string;
}

export function CopyMetadataButton({
  accessibleLabel,
  successMessage,
  value,
}: CopyMetadataButtonProps) {
  const copyingRef = useRef(false);

  const copy = async (): Promise<void> => {
    if (copyingRef.current) return;
    copyingRef.current = true;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API is unavailable.");
      }
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error("Could not copy to the clipboard.");
    } finally {
      copyingRef.current = false;
    }
  };

  return (
    <button
      aria-label={accessibleLabel}
      className="post-copy-control post-icon-plaque"
      onClick={(event) => {
        event.stopPropagation();
        void copy();
      }}
      type="button"
    >
      <Copy aria-hidden="true" size={14} />
    </button>
  );
}
