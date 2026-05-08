import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

type ConsentStatus = "granted" | "denied" | null;

const STORAGE_KEY = "gtmConsent";

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
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === "true") setConsentStatus("granted");
      else if (value === "false") setConsentStatus("denied");
    });
  }, []);

  const acceptCookies = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    setConsentStatus("granted");
    updateGtmConsent("granted");
  };

  const declineCookies = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "false");
    setConsentStatus("denied");
    updateGtmConsent("denied");
    deleteGACookies();
  };

  return {
    consentStatus,
    hasAnswered: consentStatus !== null,
    acceptCookies,
    declineCookies,
  };
};
