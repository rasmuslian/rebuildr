import { useEffect, useState } from "react";
import { Platform } from "react-native";

export const useWebShare = () => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    setIsAvailable(
      Platform.OS === "web" && typeof navigator.share === "function",
    );
  }, []);

  const share = async () => {
    if (!isAvailable) return;

    try {
      await navigator.share({ url: window.location.href });
    } catch {
      // The share sheet was dismissed.
    }
  };

  return { isAvailable, share };
};
