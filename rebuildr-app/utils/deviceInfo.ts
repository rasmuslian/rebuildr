import { Platform } from "react-native";

export const isIOSDevice = (): boolean => {
  if (Platform.OS === "web" && navigator !== undefined) {
    const userAgent = navigator.userAgent || navigator.vendor;
    return /iPad|iPhone|iPod/.test(userAgent);
  }
  return false;
};