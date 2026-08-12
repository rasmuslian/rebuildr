import { useEffect } from "react";

import { isWeb } from "@constants/layout";

//The document scrolls on web so the mobile browser chrome can collapse, which
//means the app shell grows with the page. A full-screen overlay measures its
//height from that shell, so on a long page it ends up far taller than the
//screen: its bottom lands below the fold and it opens wherever the page
//happened to be scrolled. Locking the document to one screen while such an
//overlay is open gives it the fixed-height shell it expects. Page scrolling —
//and with it the collapsing chrome — is restored the moment the lock releases.

//Overlays can stack, so the lock is reference counted: the document stays
//locked until the last holder releases it.
let lockCount = 0;
let restoreScrollY = 0;

//the app root carries a min-height that lets it grow with its content, so
//clamping only html and body would leave it — and the overlay measuring
//against it — at the full page height
const lockedElements = () => [
  document.documentElement,
  document.body,
  document.getElementById("root"),
];

const lock = () => {
  lockCount += 1;
  if (lockCount > 1) {
    return;
  }

  restoreScrollY = window.scrollY;
  lockedElements().forEach((el) => {
    if (!el) {
      return;
    }
    el.style.height = "100%";
    el.style.minHeight = "0";
    el.style.overflow = "hidden";
  });
  //the overlay measures the shell on its own layout pass and does not observe
  //style mutations, so it needs a resize to pick up the new height
  window.dispatchEvent(new Event("resize"));
};

const unlock = () => {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) {
    return;
  }

  lockedElements().forEach((el) => {
    if (!el) {
      return;
    }
    el.style.height = "";
    el.style.minHeight = "";
    el.style.overflow = "";
  });
  //restore the position the page had before locking, otherwise closing the
  //overlay drops the user back at the top
  window.scrollTo(0, restoreScrollY);
  window.dispatchEvent(new Event("resize"));
};

export const useDocumentScrollLock = (active: boolean) => {
  useEffect(() => {
    if (!isWeb || !active) {
      return;
    }

    lock();
    return unlock;
  }, [active]);
};
