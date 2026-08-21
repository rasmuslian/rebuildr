import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeVar, useReactiveVar } from "@apollo/client";
import { useEffect } from "react";
import { Platform } from "react-native";

type ConsentStatus = "granted" | "denied" | null;

const STORAGE_KEY = "gtmConsent";

// Shared across every useCookies() consumer: answering the prompt in the
// consent sheet must be visible immediately to others that wait on it (the
// onboarding welcome). Plain useState kept each caller's copy stale until the
// next reload, so the welcome never appeared in the same session as the prompt.
const consentVar = makeVar<ConsentStatus>(null);
const isReadyVar = makeVar(false);
let hydrationStarted = false;

declare const gtag: (...args: unknown[]) => void;

const updateGtmConsent = (status: "granted" | "denied") => {
  if (Platform.OS === "web" && typeof gtag !== "undefined") {
    gtag("consent", "update", { analytics_storage: status });
  }
};

const deleteGACookies = () => {
  if (Platform.OS !== "web") return;
  const domain = "." + window.location.hostname;
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    if (name.startsWith("_ga")) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
    }
  });
};

export const useCookies = () => {
  const consentStatus = useReactiveVar(consentVar);
  const isReady = useReactiveVar(isReadyVar);

  useEffect(() => {
    if (hydrationStarted) return;
    hydrationStarted = true;
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === "true") consentVar("granted");
      else if (value === "false") consentVar("denied");
      isReadyVar(true);
    });
  }, []);

  const acceptCookies = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    consentVar("granted");
    updateGtmConsent("granted");
  };

  const declineCookies = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "false");
    consentVar("denied");
    updateGtmConsent("denied");
    deleteGACookies();
  };

  return {
    isReady,
    consentStatus,
    hasAnswered: consentStatus !== null,
    acceptCookies,
    declineCookies,
  };
};
