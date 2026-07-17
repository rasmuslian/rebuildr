import { usePathname, useGlobalSearchParams } from "expo-router";
import { useEffect } from "react";
import { isWeb } from "@constants/layout";

// Restores document scroll across web navigations: back/forward returns to the
// saved offset, forward goes to the top. State is module-level (not refs)
// because this component remounts on navigation, and restore runs from popstate
// rather than a render effect since expo-router updates window.location and
// re-renders on different ticks.
const positions = new Map<string, number>();
let poppedKey: string | null = null;
let cancelRestore: (() => void) | null = null;

function locationKey() {
  return window.location.pathname + window.location.search;
}

// Scroll to target, re-applying as async content grows the page, until reached.
function restoreTo(target: number) {
  cancelRestore?.();
  if (target <= 0) {
    window.scrollTo(0, 0);
    return;
  }
  let settled = false;
  let observer: ResizeObserver | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const teardown = () => {
    settled = true;
    observer?.disconnect();
    if (timer) clearTimeout(timer);
    if (cancelRestore === teardown) cancelRestore = null;
  };
  const apply = () => {
    if (settled) return;
    window.scrollTo(0, target);
    if (window.scrollY >= target - 2) teardown();
  };
  observer = new ResizeObserver(apply);
  timer = setTimeout(teardown, 3000);
  cancelRestore = teardown;
  observer.observe(document.documentElement);
  apply();
}

export function ScrollBehavior() {
  usePathname();
  useGlobalSearchParams();
  const key = isWeb && typeof window !== "undefined" ? locationKey() : "";

  useEffect(() => {
    if (!isWeb || typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Key by the live URL so a scroll firing mid-nav can't save onto the old page.
    const onScroll = () => {
      positions.set(locationKey(), window.scrollY);
    };
    const onPopState = () => {
      poppedKey = locationKey();
      restoreTo(positions.get(locationKey()) ?? 0);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    if (!isWeb || typeof window === "undefined") return;
    if (key === poppedKey) {
      poppedKey = null; // back/forward already scrolled in onPopState
      return;
    }
    if (cancelRestore) return; // a restore is in flight
    window.scrollTo(0, 0);
  }, [key]);

  return null;
}
