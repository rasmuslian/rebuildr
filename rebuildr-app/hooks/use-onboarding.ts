import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const STORAGE_KEY = "hasSeenWelcome";
const STRIP_DISMISSED_KEY = "onboardingStripDismissed";

export const useOnboarding = () => {
  const [isReady, setIsReady] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [hasDismissedStrip, setHasDismissedStrip] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(STRIP_DISMISSED_KEY),
    ]).then(([welcome, strip]) => {
      setHasSeenWelcome(welcome === "true");
      setHasDismissedStrip(strip === "true");
      setIsReady(true);
    });
  }, []);

  const markWelcomeSeen = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    setHasSeenWelcome(true);
  };

  // "Not interested" is an answer: once the feed nudge is dismissed it stays
  // gone, and the checklist lives on only where the user goes looking for it.
  const dismissStrip = async () => {
    await AsyncStorage.setItem(STRIP_DISMISSED_KEY, "true");
    setHasDismissedStrip(true);
  };

  // Dev-only: clears the flags so the first-open welcome sheet and the feed
  // nudge can be re-triggered without reinstalling the app while testing.
  const resetWelcome = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEY, STRIP_DISMISSED_KEY]);
    setHasSeenWelcome(false);
    setHasDismissedStrip(false);
  };

  return {
    isReady,
    hasSeenWelcome,
    hasDismissedStrip,
    markWelcomeSeen,
    dismissStrip,
    resetWelcome,
  };
};
