import { useEffect } from "react";
import { View } from "react-native";

export const useOutsidePress = (
  ref: React.RefObject<View>,
  callback: () => void,
) => {
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    // Bind the event listener
    if (typeof document !== "undefined") {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [callback, ref]);
};
