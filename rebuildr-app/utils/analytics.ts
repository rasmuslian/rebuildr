import { Platform } from "react-native";

type EventParams = Record<string, string | number | boolean | undefined>;

const META_EVENT_MAP: Record<string, string> = {
  select_item: "ViewContent",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  contact_seller: "Contact",
  contact_buyer: "Contact",
  sign_up: "CompleteRegistration",
  publish_product: "SubmitApplication",
};

export function trackEvent(eventName: string, params?: EventParams) {
  if (Platform.OS !== "web") return;

  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }

  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    const metaEvent = META_EVENT_MAP[eventName];
    if (metaEvent) {
      window.fbq("track", metaEvent, params);
    }
  }
}
