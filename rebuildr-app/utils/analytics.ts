import { Platform } from "react-native";

type EventParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(eventName: string, params?: EventParams) {
  if (Platform.OS !== "web") return;

  if (typeof window !== "undefined" && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: eventName, ...params });
  }
}
