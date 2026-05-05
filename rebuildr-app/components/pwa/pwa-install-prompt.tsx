import { useEffect, useState } from "react";
import { Image, Linking, Platform, Pressable, View } from "react-native";
import { primitives } from "@constants/colors";
import { Body, Label, Title } from "@components/typography/text";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Icon, IconType } from "@components/icons/icon";
import { borderRadius } from "@constants/sizes";

const DISMISSED_KEY = "pwa-install-prompt-dismissed";
const OPEN_DELAY_MS = 2000;

type MobilePlatform = "ios" | "android";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectPlatform(): MobilePlatform | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  const isIosSafari =
    /iphone|ipad|ipod/i.test(ua) &&
    /safari/i.test(ua) &&
    !/crios|fxios|opios/i.test(ua);
  const isAndroidChrome =
    /android/i.test(ua) &&
    /chrome/i.test(ua) &&
    !/samsungbrowser|firefox|edg/i.test(ua);
  if (isIosSafari) return "ios";
  if (isAndroidChrome) return "android";
  return null;
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

export function PwaInstallPrompt() {
  const [platform, setPlatform] = useState<MobilePlatform | null>(null);
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (isInStandaloneMode()) return;
    if (
      typeof localStorage !== "undefined" &&
      localStorage.getItem(DISMISSED_KEY)
    ) {
      return;
    }
    const detected = detectPlatform();
    if (!detected) return;
    setPlatform(detected);
    const id = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = () => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(DISMISSED_KEY, "1");
    }
    setOpen(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") handleDismiss();
  };

  if (!platform) return null;

  return (
    <BottomSheet
      name="pwaInstallPrompt"
      open={open}
      onDismiss={handleDismiss}
      header={<Header onClose={handleDismiss} />}
    >
      <View style={{ gap: 10, paddingTop: 4, paddingBottom: 8 }}>
        {platform === "android" ? (
          <AndroidSteps
            deferredPrompt={deferredPrompt}
            onInstall={handleInstall}
          />
        ) : (
          <IosSteps />
        )}
        <SuccessRow />
        {platform === "ios" && <IosFooter />}
      </View>
    </BottomSheet>
  );
}

function Header({ onClose }: { onClose: () => void }) {
  return (
    <View style={{ paddingTop: 8, paddingBottom: 16 }}>
      <View
        style={{
          alignSelf: "center",
          width: 36,
          height: 4,
          borderRadius: 2,
          backgroundColor: primitives.neutrals300,
          marginBottom: 16,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Image
          source={{ uri: "/images/pwa-icon-192.png" }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
          }}
          accessibilityLabel="RebuildR"
        />
        <View style={{ flex: 1, gap: 2 }}>
          <Title size="medium">Lägg till på hemskärmen</Title>
          <Body size="small" color="secondary">
            Snabb åtkomst - som en vanlig app
          </Body>
        </View>
        <Pressable
          onPress={onClose}
          accessibilityLabel="Stäng"
          hitSlop={8}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#F4F4F4",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon icon="X" size={18} color="secondary" />
        </Pressable>
      </View>
    </View>
  );
}

function StepRow({
  number,
  children,
  trailing,
}: {
  number: number;
  children: React.ReactNode;
  trailing: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: borderRadius.medium,
        backgroundColor: "#F4F4F4",
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          backgroundColor: primitives.neutrals100,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Label size="medium" style={{ color: primitives.neutrals900 }}>
          {String(number)}
        </Label>
      </View>
      <View style={{ flex: 1 }}>{children}</View>
      <View
        style={{
          width: 24,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {trailing}
      </View>
    </View>
  );
}

function StepText({ children }: { children: React.ReactNode }) {
  return (
    <Body size="medium" color="primaryDark">
      {children}
    </Body>
  );
}

function TrailingIcon({ icon }: { icon: IconType }) {
  return <Icon icon={icon} size={20} customColor={primitives.accent600} />;
}

function AndroidSteps({
  deferredPrompt,
  onInstall,
}: {
  deferredPrompt: BeforeInstallPromptEvent | null;
  onInstall: () => void;
}) {
  return (
    <>
      {deferredPrompt && (
        <>
          <Pressable
            onPress={onInstall}
            style={{
              backgroundColor: primitives.accent600,
              borderRadius: borderRadius.medium,
              height: 40,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Icon icon="download" size={16} customColor="white" />
            <Label size="large" style={{ color: "white" }}>
              Installera appen
            </Label>
          </Pressable>
          <OrSeparator />
        </>
      )}
      <StepRow number={1} trailing={<TrailingIcon icon="kebab" />}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          <StepText>Tryck</StepText>
          <Icon icon="kebab" size={14} customColor={primitives.neutrals900} />
          <StepText>uppe till höger i webbläsaren</StepText>
        </View>
      </StepRow>
      <StepRow number={2} trailing={<TrailingIcon icon="download" />}>
        <StepText>"Installera appen"</StepText>
      </StepRow>
    </>
  );
}

function IosSteps() {
  return (
    <>
      <StepRow number={1} trailing={<TrailingIcon icon="upload" />}>
        <StepText>Tryck dela-ikonen längst ner</StepText>
      </StepRow>
      <StepRow number={2} trailing={<TrailingIcon icon="+" />}>
        <StepText>"lägg till på hemskärmen"</StepText>
      </StepRow>
      <StepRow number={3} trailing={<TrailingIcon icon="check" />}>
        <StepText>Tryck "Lägg till" uppe till höger</StepText>
      </StepRow>
    </>
  );
}

function OrSeparator() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 4,
      }}
    >
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: primitives.neutrals200,
        }}
      />
      <Body size="small" color="secondary">
        eller via menyn
      </Body>
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: primitives.neutrals200,
        }}
      />
    </View>
  );
}

function SuccessRow() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: primitives.primary100,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          backgroundColor: primitives.neutrals100,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon icon="check" size={18} customColor={primitives.primary600} />
      </View>
      <Body size="medium" style={{ color: primitives.primary600 }}>
        Klart! RebuildR finns bland dina appar.
      </Body>
    </View>
  );
}

function IosFooter() {
  return (
    <View style={{ alignItems: "center", gap: 2, paddingTop: 4 }}>
      <Body size="small" color="secondary">
        Använder du en annan webbläsare?
      </Body>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Body size="small" color="secondary">
          {"Öppna "}
        </Body>
        <Pressable onPress={() => Linking.openURL("https://rebuildr.se")}>
          <Body
            size="small"
            style={{
              color: primitives.accent600,
              textDecorationLine: "underline",
            }}
          >
            rebuildr.se
          </Body>
        </Pressable>
        <Body size="small" color="secondary">
          {" i Safari först"}
        </Body>
      </View>
    </View>
  );
}
