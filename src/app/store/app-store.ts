import { createStore } from "zustand/vanilla";

import {
  type SessionSlice,
  createSessionSlice,
} from "@/entities/session";
import { type PostsSlice, createPostsSlice } from "@/entities/post";

import {
  type ModalSlice,
  createModalSlice,
} from "./modal-slice";

export type AppStore = ModalSlice & PostsSlice & SessionSlice;
export type AppStoreApi = ReturnType<typeof createAppStore>;

export function createAppStore() {
  return createStore<AppStore>()((...args) => ({
    ...createModalSlice(...args),
    ...createPostsSlice(...args),
    ...createSessionSlice(...args),
  }));
}
