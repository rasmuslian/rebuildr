import { useEffect } from "react";
import { isWeb } from "@constants/layout";

// Locks document scroll while an overlay is open (web). Reference-counted so
// stacked overlays don't unlock each other before the last one closes.
let lockCount = 0;
let previousOverflow = "";

function lock() {
  if (typeof document === "undefined") return;
  if (lockCount === 0) {
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
  }
  lockCount += 1;
}

function unlock() {
  if (typeof document === "undefined") return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.documentElement.style.overflow = previousOverflow;
  }
}

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!isWeb || !active) return;
    lock();
    return unlock;
  }, [active]);
}
