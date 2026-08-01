import { createStore } from "zustand/vanilla";

import {
  type SessionSlice,
  createSessionSlice,
} from "@/entities/session";

import {
  type ModalSlice,
  createModalSlice,
} from "./modal-slice";

export type AppStore = ModalSlice & SessionSlice;
export type AppStoreApi = ReturnType<typeof createAppStore>;

export function createAppStore() {
  return createStore<AppStore>()((...args) => ({
    ...createModalSlice(...args),
    ...createSessionSlice(...args),
  }));
}
