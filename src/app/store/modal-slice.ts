import type { StateCreator } from "zustand";

export type ModalKind = "login" | "register" | null;

export interface ModalSlice {
  closeModal: () => void;
  modal: ModalKind;
  openLogin: () => void;
  openRegister: () => void;
}

export const createModalSlice: StateCreator<
  ModalSlice,
  [],
  [],
  ModalSlice
> = (set) => ({
  closeModal: () => {
    set({ modal: null });
  },
  modal: null,
  openLogin: () => {
    set({ modal: "login" });
  },
  openRegister: () => {
    set({ modal: "register" });
  },
});
