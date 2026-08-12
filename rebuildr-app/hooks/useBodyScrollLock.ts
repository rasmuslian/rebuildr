import { useEffect } from "react";
import { isWeb } from "@constants/layout";

// Locks document scroll while an overlay is open (web). Reference-counted so
// stacked overlays don't unlock each other before the last one closes.
let lockCount = 0;
let scrollY = 0;

// overflow: hidden on the document unsticks position:sticky descendants
// (they fall back to their static flow position) and drops the scrollbar,
// shifting the layout width — freezing body in place with position: fixed
// avoids both.
function lock() {
  if (typeof document === "undefined") return;
  if (lockCount === 0) {
    const html = document.documentElement;
    const body = document.body;
    scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.width =
      scrollbarWidth > 0 ? `calc(100% - ${scrollbarWidth}px)` : "100%";
  }
  lockCount += 1;
}

function unlock() {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    const body = document.body;
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.width = "";
    window.scrollTo(0, scrollY);
  }
}

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!isWeb || !active) return;
    lock();
    return unlock;
  }, [active]);
}
