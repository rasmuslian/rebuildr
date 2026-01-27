import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export const shareUrl = async (url: string) => {
  function copyToClipboardFallback(text: string) {
    const textarea = document.createElement("textarea");
    textarea.value = text;

    // Prevent scrolling to bottom
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(textarea);
    }
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(url, {
      dialogTitle: "Dela din QR-kod",
      anchor: {
        x: 100,
        y: 100,
      },
    });
  }
  if (Platform.OS === "web") {
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // user cancelled — ignore
        return;
      }
    }

    // Copy to clipboard (desktop browsers)
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      alert("QR-kod kopierad!");
      return;
    }

    // Fallback
    copyToClipboardFallback(url);
    alert("QR-kod kopierad!");
  }
};
