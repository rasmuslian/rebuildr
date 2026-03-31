import { useEffect, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { primitives } from "@constants/colors";
import { Body, Label } from "@components/typography/text";

const DISMISSED_KEY = "pwa-ios-prompt-dismissed";

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|opios/i.test(ua);
  return isIos && isSafari;
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function IosInstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (
      Platform.OS !== "web" ||
      !isIosSafari() ||
      isInStandaloneMode() ||
      localStorage.getItem(DISMISSED_KEY)
    ) {
      return;
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  };

  return (
    <View
      style={{
        // @ts-ignore - web-only style
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: primitives.neutrals100,
        borderTopWidth: 1,
        borderTopColor: primitives.neutrals200,
        paddingHorizontal: 20,
        paddingVertical: 16,
        paddingBottom: 32,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      }}
    >
      {/* Share arrow icon using Unicode */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: primitives.primary100,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Body
          size="medium"
          style={{ fontSize: 20, lineHeight: 24 }}
        >
          {"⬆"}
        </Body>
      </View>

      <View style={{ flex: 1, gap: 2 }}>
        <Label size="medium" color="primaryDark">
          Installera RebuildR
        </Label>
        <Body size="small" color="secondary">
          Tryck på{" "}
          <Body size="small" color="secondary" style={{ fontWeight: "700" }}>
            Dela {"⬆"}
          </Body>{" "}
          och välj{" "}
          <Body size="small" color="secondary" style={{ fontWeight: "700" }}>
            Lägg till på hemskärmen
          </Body>
        </Body>
      </View>

      <Pressable
        onPress={handleDismiss}
        style={{ padding: 8, flexShrink: 0 }}
        accessibilityLabel="Stäng"
      >
        <Body size="medium" color="secondary" style={{ fontSize: 18 }}>
          ✕
        </Body>
      </Pressable>
    </View>
  );
}
