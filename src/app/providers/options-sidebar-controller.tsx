"use client";

import { OptionsSidebar } from "@/widgets/options-sidebar";

import { useAppStore, useAppStoreApi } from "../store/store-provider";

export function OptionsSidebarController() {
  const store = useAppStoreApi();
  const disabled = useAppStore((state) => state.eraseStatus === "erasing");
  const rules = useAppStore((state) => state.rules);
  return <OptionsSidebar disabled={disabled} onChange={(next) => store.getState().setRules(next)} rules={rules} />;
}
