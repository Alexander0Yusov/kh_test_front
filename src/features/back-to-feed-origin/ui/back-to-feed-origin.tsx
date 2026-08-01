"use client";

import { ArrowUp } from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";

interface BackToFeedOriginProps {
  blocked: boolean;
  horizontalOwnerRef: RefObject<HTMLElement | null>;
  resetKey: number;
  topAnchorRef: RefObject<HTMLElement | null>;
  verticalOwnerRef: RefObject<HTMLElement | null>;
}

export function BackToFeedOrigin({
  blocked,
  horizontalOwnerRef,
  resetKey,
  topAnchorRef,
  verticalOwnerRef,
}: BackToFeedOriginProps) {
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const horizontalOwner = horizontalOwnerRef.current;
    const verticalOwner = verticalOwnerRef.current;
    if (!horizontalOwner || !verticalOwner) return;
    const owners = new Set([horizontalOwner, verticalOwner]);

    const updateVisibility = (): void => {
      frameRef.current = null;
      const nextVisible = verticalOwner.scrollTop > 0 || horizontalOwner.scrollLeft > 0;
      if (nextVisible === visibleRef.current) return;
      visibleRef.current = nextVisible;
      setVisible(nextVisible);
    };
    const scheduleUpdate = (): void => {
      if (frameRef.current !== null) return;
      frameRef.current = requestAnimationFrame(updateVisibility);
    };

    for (const owner of owners) owner.addEventListener("scroll", scheduleUpdate, { passive: true });
    scheduleUpdate();
    return () => {
      for (const owner of owners) owner.removeEventListener("scroll", scheduleUpdate);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [horizontalOwnerRef, resetKey, verticalOwnerRef]);

  const returnToOrigin = (): void => {
    const horizontalOwner = horizontalOwnerRef.current;
    const verticalOwner = verticalOwnerRef.current;
    if (!horizontalOwner || !verticalOwner) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

    topAnchorRef.current?.focus({ preventScroll: true });
    if (horizontalOwner === verticalOwner) {
      verticalOwner.scrollTo({ behavior, left: 0, top: 0 });
      return;
    }
    verticalOwner.scrollTo({ behavior, top: 0 });
    horizontalOwner.scrollTo({ behavior, left: 0 });
  };

  const interactive = visible && !blocked;
  return (
    <button
      aria-hidden={!visible || blocked}
      aria-label="Back to top and left"
      className={`back-to-feed-origin${visible ? " is-visible" : ""}`}
      disabled={!interactive}
      onClick={returnToOrigin}
      tabIndex={interactive ? 0 : -1}
      title="Back to top and left"
      type="button"
    >
      <ArrowUp aria-hidden="true" size={18} />
    </button>
  );
}
