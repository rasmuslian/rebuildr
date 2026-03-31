import { useEffect, useState } from "react";
import { Platform } from "react-native";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent;
  }
}

export function usePwaInstall() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log("inside useeffect");
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    console.log(
      'window.matchMedia("(display-mode: standalone)") :>> ',
      window.matchMedia("(display-mode: standalone)"),
    );

    // Already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("already in standalone");
      setIsInstalled(true);
      return;
    }

    // Event may have fired before React hydrated — pick it up from window
    if (window.__pwaInstallPrompt) {
      setPromptEvent(window.__pwaInstallPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      console.log("handleAppInstalled :>> ");
      setIsInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = async () => {
    console.log("install");
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    console.log("outcome :>> ", outcome);
    if (outcome === "accepted") {
      setIsInstalled(true);
      setPromptEvent(null);
    }
  };

  return {
    canInstall: !!promptEvent,
    isInstalled,
    install,
  };
}
