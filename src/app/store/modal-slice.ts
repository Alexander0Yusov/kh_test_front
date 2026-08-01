import type { StateCreator } from "zustand";

export type ModalKind = "attachmentPreview" | "createRootPost" | "eraseAll" | "login" | "postInteraction" | "register" | null;

export interface ModalSlice {
  closeModal: () => void;
  attachmentPreviewPostId: string | null;
  postInteractionPostId: string | null;
  modal: ModalKind;
  openLogin: () => void;
  openAttachmentPreview: (postId: string) => void;
  openCreateRootPost: () => void;
  openEraseAll: () => void;
  openPostInteraction: (postId: string) => void;
  openRegister: () => void;
}

export const createModalSlice: StateCreator<
  ModalSlice,
  [],
  [],
  ModalSlice
> = (set) => ({
  closeModal: () => {
    set({ attachmentPreviewPostId: null, modal: null, postInteractionPostId: null });
  },
  attachmentPreviewPostId: null,
  modal: null,
  postInteractionPostId: null,
  openLogin: () => {
    set({ attachmentPreviewPostId: null, modal: "login", postInteractionPostId: null });
  },
  openAttachmentPreview: (postId) => {
    set({ attachmentPreviewPostId: postId, modal: "attachmentPreview", postInteractionPostId: null });
  },
  openCreateRootPost: () => {
    set({ attachmentPreviewPostId: null, modal: "createRootPost", postInteractionPostId: null });
  },
  openEraseAll: () => {
    set({ attachmentPreviewPostId: null, modal: "eraseAll", postInteractionPostId: null });
  },
  openPostInteraction: (postId) => {
    set({ attachmentPreviewPostId: null, modal: "postInteraction", postInteractionPostId: postId });
  },
  openRegister: () => {
    set({ attachmentPreviewPostId: null, modal: "register", postInteractionPostId: null });
  },
});
