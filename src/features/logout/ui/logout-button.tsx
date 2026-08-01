"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { RestClient } from "@/shared/api";
import { Button } from "@/shared/ui/button";

import { logoutUser } from "../model/logout-user";

interface LogoutButtonProps {
  client: RestClient;
  onAnonymous: () => void;
}

export function LogoutButton({
  client,
  onAnonymous,
}: LogoutButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout(): Promise<void> {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const result = await logoutUser(client);
    setIsSubmitting(false);

    if (result === "error") {
      toast.error("Could not log out. Please try again.");
      return;
    }

    onAnonymous();

    if (result === "success") {
      toast.success("You have logged out.");
    }
  }

  return (
    <Button disabled={isSubmitting} onClick={handleLogout}>
      {isSubmitting ? "Logging out…" : "Log Out"}
    </Button>
  );
}
