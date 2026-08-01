"use client";

import {
  type ReactNode,
  type RefObject,
  createContext,
  use,
  useRef,
} from "react";

interface AuthTriggerRefs {
  login: RefObject<HTMLButtonElement | null>;
  register: RefObject<HTMLButtonElement | null>;
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

  return (
    <LoginTriggerContext.Provider
      value={{ login: loginTriggerRef, register: registerTriggerRef }}
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
