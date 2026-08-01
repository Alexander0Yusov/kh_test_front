"use client";

import { OptionsSidebar } from "@/widgets/options-sidebar";

import { useAppStore, useAppStoreApi } from "../store/store-provider";

export function OptionsSidebarController() {
  const store = useAppStoreApi();
  const rules = useAppStore((state) => state.rules);
  return <OptionsSidebar onChange={(next) => store.getState().setRules(next)} rules={rules} />;
}
