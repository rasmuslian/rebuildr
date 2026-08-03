import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { View } from "react-native";
import LogoIconLight from "@assets/svgs/logo-icon-light.svg";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { Header } from "@components/navigation/headers/header";
import { Popup } from "@components/popup/popup";
import { Body, Display, Title } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { Icon, IconType } from "@icons/icon";
import { useCookies } from "@hooks/use-cookies";
import { useOnboarding } from "@hooks/use-onboarding";
import { useScreenType } from "@hooks/useScreenType";

const WELCOME_ROWS: { icon: IconType; title: string; body: string }[] = [
  {
    icon: "search",
    title: "Hitta fynd nära dig",
    body: "Bläddra bland begagnat byggmaterial och verktyg till bra pris.",
  },
  {
    icon: "magic",
    title: "Sälj enkelt",
    body: "Lägg till foton, så skriver vår AI annonsen åt dig.",
  },
  {
    icon: "message",
    title: "Fråga Återbyggaren",
    body: "Få hjälp att räkna ut vad ditt projekt behöver.",
  },
];

const WelcomeRow = ({
  icon,
  title,
  body,
}: {
  icon: IconType;
  title: string;
  body: string;
}) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: borderRadius.full,
        backgroundColor: primitives.primary200,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon icon={icon} color="primaryDark" size={20} />
    </View>
    <View style={{ flex: 1, gap: 2 }}>
      <Title size="small">{title}</Title>
      <Body size="medium" color="secondary">
        {body}
      </Body>
    </View>
  </View>
);

const WelcomeContent = () => (
  <View style={{ paddingBottom: 8 }}>
    <View style={{ alignItems: "center", marginBottom: 24, marginTop: 8 }}>
      <Image source={LogoIconLight} style={{ width: 96, height: 96 }} />
    </View>
    <View style={{ gap: 8, marginBottom: 24 }}>
      <Display size="small" style={{ textAlign: "center" }}>
        Välkommen till RebuildR
      </Display>
      <Body size="large" color="secondary" style={{ textAlign: "center" }}>
        Sveriges marknadsplats för återbrukat byggmaterial & verktyg.
      </Body>
    </View>
    <View style={{ gap: 16 }}>
      {WELCOME_ROWS.map((row) => (
        <WelcomeRow key={row.title} {...row} />
      ))}
    </View>
  </View>
);

const WelcomeFooter = ({ onExplore }: { onExplore: () => void }) => (
  <Button label="Börja utforska" onPress={onExplore} />
);

export const OnboardingWelcome = () => {
  const { isReady, hasSeenWelcome, markWelcomeSeen } = useOnboarding();
  const { isReady: cookiesReady, hasAnswered } = useCookies();
  const { isDesktop } = useScreenType();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isReady || !cookiesReady) return;
    // Only surface once the cookie prompt is resolved so two sheets never
    // stack on the very first open.
    setShow(!hasSeenWelcome && hasAnswered);
  }, [isReady, cookiesReady, hasSeenWelcome, hasAnswered]);

  const dismiss = () => {
    setShow(false);
    markWelcomeSeen();
  };

  if (!isReady) return null;

  if (isDesktop) {
    return (
      <Popup
        open={show}
        onClose={dismiss}
        type="partial"
        footer={
          <View style={{ padding: 24, paddingTop: 0 }}>
            <WelcomeFooter onExplore={dismiss} />
          </View>
        }
      >
        <View style={{ padding: 24, paddingBottom: 8 }}>
          <Header
            title=""
            showBackButton={false}
            ctas={[{ icon: "X", onPress: dismiss }]}
          />
          <WelcomeContent />
        </View>
      </Popup>
    );
  }

  return (
    <BottomSheet
      name="onboarding-welcome"
      open={show}
      onDismiss={dismiss}
      scrollable
      isStickyFooter
      header={
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingTop: 8,
          }}
        >
          <Button icon="X" type="text" onPress={dismiss} />
        </View>
      }
      footer={<WelcomeFooter onExplore={dismiss} />}
    >
      <View style={{ marginTop: 8 }}>
        <WelcomeContent />
      </View>
    </BottomSheet>
  );
};
