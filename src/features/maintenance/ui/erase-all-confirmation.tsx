"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";

import { Button } from "@/shared/ui/button";

interface EraseAllConfirmationProps {
  onCancel: () => void;
  onConfirm: () => void;
  status: "erasing" | "failed" | "idle";
}

export function EraseAllConfirmation({ onCancel, onConfirm, status }: EraseAllConfirmationProps) {
  const erasing = status === "erasing";
  return (
    <section className="erase-all-confirmation">
      <h3><AlertTriangle aria-hidden="true" size={22} /> ⚠️ WARNING</h3>
      <p>
        This endpoint exists exclusively for convenient reset and demonstration of the test project. It irreversibly deletes all application database records, uploaded storage objects, and temporary project resources. This approach must never be exposed or implemented in a production business system.
      </p>
      {status === "failed" ? <p className="form-error" role="alert">Could not erase project data</p> : null}
      <div className="erase-all-actions">
        <Button autoFocus disabled={erasing} onClick={onCancel}>Cancel</Button>
        <Button className="ui-button-destructive" disabled={erasing} onClick={onConfirm}>
          {erasing ? <><LoaderCircle aria-hidden="true" className="progress-icon" size={16} /> Erasing…</> : "Erase All"}
        </Button>
      </div>
    </section>
  );
}
