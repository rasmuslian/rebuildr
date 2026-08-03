import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const STORAGE_KEY = "hasSeenWelcome";

export const useOnboarding = () => {
  const [isReady, setIsReady] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      setHasSeenWelcome(value === "true");
      setIsReady(true);
    });
  }, []);

  const markWelcomeSeen = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    setHasSeenWelcome(true);
  };

  // Dev-only: clears the flag so the first-open welcome sheet can be
  // re-triggered without reinstalling the app while testing.
  const resetWelcome = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setHasSeenWelcome(false);
  };

  return { isReady, hasSeenWelcome, markWelcomeSeen, resetWelcome };
};
