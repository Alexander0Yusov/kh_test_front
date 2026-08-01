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

export type EraseStatus = "erasing" | "failed" | "idle";

interface ApplicationActions {
  beginErase: () => boolean;
  eraseStatus: EraseStatus;
  resetApplicationData: () => void;
  resetEraseStatus: () => void;
  resetEpoch: number;
  setEraseFailed: () => void;
}

export type AppStore = ApplicationActions & ModalSlice & PostsSlice & SessionSlice;
export type AppStoreApi = ReturnType<typeof createAppStore>;

export function createAppStore() {
  return createStore<AppStore>()((set, get, store) => ({
    ...createModalSlice(set, get, store),
    ...createPostsSlice(set, get, store),
    ...createSessionSlice(set, get, store),
    beginErase: () => {
      if (get().eraseStatus === "erasing") return false;
      set({ eraseStatus: "erasing" });
      return true;
    },
    eraseStatus: "idle",
    resetApplicationData: () => {
      set((state) => ({
        accessToken: null,
        attachmentPreviewPostId: null,
        currentUser: null,
        eraseStatus: "idle",
        generation: state.generation + 1,
        hasMore: true,
        loadingCursor: null,
        modal: null,
        nextCursor: null,
        postInteractionPostId: null,
        postsById: {},
        postsError: null,
        postsStatus: "idle",
        reloadToken: state.reloadToken + 1,
        resetEpoch: state.resetEpoch + 1,
        rootIds: [],
        sessionError: null,
        status: "anonymous",
      }));
    },
    resetEraseStatus: () => set({ eraseStatus: "idle" }),
    resetEpoch: 0,
    setEraseFailed: () => set({ eraseStatus: "failed" }),
  }));
}
