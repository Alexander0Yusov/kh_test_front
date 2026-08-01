"use client";

import {
  type ReactNode,
  type RefObject,
  createContext,
  use,
  useRef,
} from "react";

const LoginTriggerContext =
  createContext<RefObject<HTMLButtonElement | null> | null>(null);

interface LoginTriggerProviderProps {
  children: ReactNode;
}

export function LoginTriggerProvider({
  children,
}: LoginTriggerProviderProps) {
  const loginTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <LoginTriggerContext.Provider value={loginTriggerRef}>
      {children}
    </LoginTriggerContext.Provider>
  );
}

export function useLoginTriggerRef(): RefObject<HTMLButtonElement | null> {
  const ref = use(LoginTriggerContext);

  if (!ref) {
    throw new Error("LoginTriggerProvider is missing.");
  }

  return ref;
}
