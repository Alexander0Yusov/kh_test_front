import type { StateCreator } from "zustand";

import type { components } from "@/shared/api";

export type CurrentUser =
  components["schemas"]["GetCurrentUserResponseDto"];

export type SessionStatus =
  | "idle"
  | "restoring"
  | "anonymous"
  | "authenticated"
  | "error";

export interface SessionSlice {
  accessToken: string | null;
  beginRestore: () => void;
  clearSession: () => void;
  currentUser: CurrentUser | null;
  sessionError: string | null;
  setAnonymous: () => void;
  setAuthenticated: (
    accessToken: string,
    currentUser: CurrentUser,
  ) => void;
  setSessionError: (message: string) => void;
  status: SessionStatus;
}

export const createSessionSlice: StateCreator<
  SessionSlice,
  [],
  [],
  SessionSlice
> = (set) => ({
  accessToken: null,
  beginRestore: () => {
    set({
      accessToken: null,
      currentUser: null,
      sessionError: null,
      status: "restoring",
    });
  },
  clearSession: () => {
    set({
      accessToken: null,
      currentUser: null,
      sessionError: null,
      status: "anonymous",
    });
  },
  currentUser: null,
  sessionError: null,
  setAnonymous: () => {
    set({
      accessToken: null,
      currentUser: null,
      sessionError: null,
      status: "anonymous",
    });
  },
  setAuthenticated: (accessToken, currentUser) => {
    set({
      accessToken,
      currentUser,
      sessionError: null,
      status: "authenticated",
    });
  },
  setSessionError: (message) => {
    set({
      accessToken: null,
      currentUser: null,
      sessionError: message,
      status: "error",
    });
  },
  status: "idle",
});
