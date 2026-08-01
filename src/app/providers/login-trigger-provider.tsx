"use client";

import {
  type ReactNode,
  type RefObject,
  createContext,
  use,
  useRef,
} from "react";

interface AuthTriggerRefs {
  createMessage: RefObject<HTMLButtonElement | null>;
  eraseAll: RefObject<HTMLButtonElement | null>;
  login: RefObject<HTMLButtonElement | null>;
  register: RefObject<HTMLButtonElement | null>;
  returnFocus: RefObject<HTMLElement | null>;
  setReturnFocus: (element: HTMLElement | null) => void;
}

const LoginTriggerContext = createContext<AuthTriggerRefs | null>(null);

interface LoginTriggerProviderProps {
  children: ReactNode;
}

export function LoginTriggerProvider({
  children,
}: LoginTriggerProviderProps) {
  const loginTriggerRef = useRef<HTMLButtonElement>(null);
  const registerTriggerRef = useRef<HTMLButtonElement>(null);
  const createMessageTriggerRef = useRef<HTMLButtonElement>(null);
  const eraseAllTriggerRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement>(null);

  return (
    <LoginTriggerContext.Provider
      value={{
        createMessage: createMessageTriggerRef,
        eraseAll: eraseAllTriggerRef,
        login: loginTriggerRef,
        register: registerTriggerRef,
        returnFocus: returnFocusRef,
        setReturnFocus: (element) => {
          returnFocusRef.current = element;
        },
      }}
    >
      {children}
    </LoginTriggerContext.Provider>
  );
}

export function useLoginTriggerRef(): RefObject<HTMLButtonElement | null> {
  const ref = use(LoginTriggerContext);

  if (!ref) {
    throw new Error("LoginTriggerProvider is missing.");
  }

  return ref.login;
}

export function useRegisterTriggerRef(): RefObject<HTMLButtonElement | null> {
  const ref = use(LoginTriggerContext);

  if (!ref) {
    throw new Error("LoginTriggerProvider is missing.");
  }

  return ref.register;
}

export function useCreateMessageTriggerRef(): RefObject<HTMLButtonElement | null> {
  const ref = use(LoginTriggerContext);
  if (!ref) throw new Error("LoginTriggerProvider is missing.");
  return ref.createMessage;
}

export function useEraseAllTriggerRef(): RefObject<HTMLButtonElement | null> {
  const ref = use(LoginTriggerContext);
  if (!ref) throw new Error("LoginTriggerProvider is missing.");
  return ref.eraseAll;
}

export function useModalReturnFocus(): Pick<
  AuthTriggerRefs,
  "returnFocus" | "setReturnFocus"
> {
  const value = use(LoginTriggerContext);
  if (!value) throw new Error("LoginTriggerProvider is missing.");
  return {
    returnFocus: value.returnFocus,
    setReturnFocus: value.setReturnFocus,
  };
}
