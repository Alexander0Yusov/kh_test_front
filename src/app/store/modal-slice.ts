import type { StateCreator } from "zustand";

export type ModalKind = "attachmentPreview" | "createRootPost" | "login" | "register" | null;

export interface ModalSlice {
  closeModal: () => void;
  attachmentPreviewPostId: string | null;
  modal: ModalKind;
  openLogin: () => void;
  openAttachmentPreview: (postId: string) => void;
  openCreateRootPost: () => void;
  openRegister: () => void;
}

export const createModalSlice: StateCreator<
  ModalSlice,
  [],
  [],
  ModalSlice
> = (set) => ({
  closeModal: () => {
    set({ attachmentPreviewPostId: null, modal: null });
  },
  attachmentPreviewPostId: null,
  modal: null,
  openLogin: () => {
    set({ attachmentPreviewPostId: null, modal: "login" });
  },
  openAttachmentPreview: (postId) => {
    set({ attachmentPreviewPostId: postId, modal: "attachmentPreview" });
  },
  openCreateRootPost: () => {
    set({ attachmentPreviewPostId: null, modal: "createRootPost" });
  },
  openRegister: () => {
    set({ attachmentPreviewPostId: null, modal: "register" });
  },
});
