"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { PostsQueryRules } from "@/entities/post";
import { PostsOptionsControls } from "@/features/posts-options";

interface OptionsSidebarProps {
  disabled: boolean;
  onChange: (rules: PostsQueryRules) => void;
  rules: PostsQueryRules;
}

export function OptionsSidebar({ disabled, onChange, rules }: OptionsSidebarProps) {
  const [open, setOpen] = useState(true);
  const asideRef = useRef<HTMLElement | null>(null);
  const pointerInsideRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const cancelClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };
  const scheduleClose = () => {
    cancelClose();
    if (asideRef.current?.contains(document.activeElement)) return;
    timerRef.current = setTimeout(() => setOpen(false), 500);
  };
  const scheduleCloseAfterFocusLeaves = () => {
    cancelClose();
    timerRef.current = setTimeout(() => setOpen(false), 500);
  };

  useEffect(() => () => cancelClose(), []);

  return (
    <aside className={`options-sidebar-dock${open ? " is-open" : ""}`} onBlur={(event) => {
      if (!pointerInsideRef.current && !event.currentTarget.contains(event.relatedTarget)) scheduleCloseAfterFocusLeaves();
    }} onFocus={cancelClose} onKeyDown={(event) => {
      if (event.key === "Escape" && open) {
        event.preventDefault();
        event.stopPropagation();
        cancelClose();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }} onMouseEnter={() => { pointerInsideRef.current = true; cancelClose(); }} onMouseLeave={() => { pointerInsideRef.current = false; scheduleClose(); }} ref={asideRef}>
      <button aria-controls="options-sidebar-panel" aria-expanded={open} aria-label={open ? "Close options" : "Open options"} className="options-sidebar-handle" onClick={() => { cancelClose(); setOpen((value) => !value); }} ref={triggerRef} type="button">
        {open ? <ChevronRight aria-hidden="true" size={18} /> : <ChevronLeft aria-hidden="true" size={18} />}
      </button>
      <div aria-disabled={disabled || undefined} aria-hidden={!open} className="options-sidebar-panel" id="options-sidebar-panel" inert={!open || disabled ? true : undefined}>
        <h2>Options</h2>
        <PostsOptionsControls onChange={onChange} rules={rules} />
      </div>
    </aside>
  );
}
