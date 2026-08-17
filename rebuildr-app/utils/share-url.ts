import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

type ShareUrlOptions = {
  dialogTitle?: string;
  copiedMessage?: string;
  title?: string;
};

function copyToClipboardFallback(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;

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

export const shareUrl = async (
  url: string,
  {
    dialogTitle = "Dela länk",
    copiedMessage = "Länk kopierad!",
    title,
  }: ShareUrlOptions = {},
) => {
  if (Platform.OS === "web") {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return;
      }
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      copyToClipboardFallback(url);
    }

    alert(copiedMessage);
    return;
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(url, {
      dialogTitle,
      anchor: {
        x: 100,
        y: 100,
      },
    });
  }
};
