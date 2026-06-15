import { router, useFocusEffect } from "expo-router";
import Head from "expo-router/head";
import { useCallback } from "react";
import { Pressable, ScrollView, useWindowDimensions, View } from "react-native";

import Footer from "@components/navigation/footer";
import TopBar from "@components/navigation/top-bar/top-bar";
import { useThemeColor } from "@hooks/useThemeColor";
import { Body, Headline, Label } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { borderRadius, horizontalPadding } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { Icon } from "@icons/icon";

export default function BygghjalpenLandingPage() {
  const { isDesktop } = useScreenType();
  const { height: windowHeight } = useWindowDimensions();
  const topBarHeight = isDesktop ? 72 : 56;
  const heroMinHeight = Math.max(windowHeight - topBarHeight, 0);
  const exampleQuestions = [
    "Vilket virke passar till en enkel altan?",
    "Hur räknar jag material till en gipsvägg?",
    "Vad kan jag köpa begagnat till badrummet?",
  ];

  useFocusEffect(
    useCallback(() => {
      if (typeof document === "undefined") return;
      document.body.style.backgroundColor = primitives.primary800;
      return () => {
        document.body.style.backgroundColor = "";
      };
    }, []),
  );

  return (
    <>
      <Head>
        <title>RebuildR - Bygghjälpen</title>
        <meta
          name="description"
          content="Bygghjälpen hjälper dig planera bygg, renovering och återbrukade materialval."
        />
      </Head>

      <View style={{ flex: 1, backgroundColor: primitives.primary800 }}>
        <TopBar theme="dark" showSearchBar={false} />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              justifyContent: "center",
              minHeight: heroMinHeight,
              overflow: "hidden",
              paddingBottom: isDesktop ? 72 : 40,
              paddingHorizontal: isDesktop
                ? horizontalPadding.desktop
                : horizontalPadding.mobile,
              paddingTop: isDesktop ? 72 : 40,
              position: "relative",
            }}
          >
            <HeroPattern />
            <View
              style={{
                alignSelf: "center",
                flexDirection: isDesktop ? "row" : "column",
                gap: isDesktop ? 56 : 28,
                maxWidth: 1200,
                width: "100%",
              }}
            >
              <View style={{ flex: 1, gap: 20, maxWidth: 700 }}>
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: primitives.neutrals10,
                    borderColor: primitives.neutrals50,
                    borderRadius: 999,
                    borderWidth: 1,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Label
                    size="medium"
                    style={{ color: primitives.secondary200 }}
                  >
                    Bygg, material och återbruk
                  </Label>
                </View>
                <Headline
                  size="large"
                  style={{ color: primitives.secondary200, maxWidth: 640 }}
                >
                  Bygghjälpen hjälper dig tänka klart innan du börjar.
                </Headline>
                <Body
                  style={{
                    color: primitives.secondary200,
                    maxWidth: 590,
                    opacity: 0.9,
                  }}
                >
                  Beskriv ditt projekt och få vägledning kring material, mått,
                  verktyg, arbetsordning och vad som kan vara smart att köpa
                  återbrukat på RebuildR.
                </Body>
                <View
                  style={{
                    flexDirection: isDesktop ? "row" : "column",
                    gap: 12,
                  }}
                >
                  <HeroButton
                    onPress={() => router.navigate("/bygghjalpen/chat")}
                  />
                  <View
                    style={{
                      alignItems: "center",
                      alignSelf: isDesktop ? "center" : "stretch",
                      justifyContent: "center",
                      backgroundColor: primitives.neutrals10,
                      borderRadius: borderRadius.medium,
                      minHeight: 44,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                    }}
                  >
                    <Label
                      size="large"
                      style={{ color: primitives.secondary200 }}
                    >
                      Svar på svenska
                    </Label>
                  </View>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: primitives.secondary200,
                  borderRadius: 16,
                  gap: 14,
                  padding: 16,
                  width: isDesktop ? 380 : "100%",
                }}
              >
                <Label size="large">Exempel på vad du kan fråga</Label>
                {exampleQuestions.map((question) => (
                  <ExampleLine key={question} text={question} />
                ))}
              </View>
            </View>
          </View>
          <Footer />
        </ScrollView>
      </View>
    </>
  );
}

const HeroButton = ({ onPress }: { onPress: () => void }) => {
  const colors = useThemeColor("dark");

  return (
    <Pressable onPress={onPress}>
      {({ hovered, pressed }) => {
        let backgroundColor = colors.buttons.filled.enabled;

        if (pressed) {
          backgroundColor = colors.buttons.filled.pressed;
        } else if (hovered) {
          backgroundColor = colors.buttons.filled.hovered;
        }

        return (
          <View
            style={{
              alignItems: "center",
              backgroundColor,
              borderRadius: borderRadius.medium,
              flexDirection: "row",
              gap: 8,
              justifyContent: "center",
              minHeight: 44,
              paddingHorizontal: 18,
              paddingVertical: 10,
            }}
          >
            <Label size="large">Ställ fråga</Label>
            <Icon icon="arrowRight" color="primaryDark" size={18} />
          </View>
        );
      }}
    </Pressable>
  );
};

const ExampleLine = ({ text }: { text: string }) => {
  return (
    <Pressable
      onPress={() =>
        router.navigate({
          pathname: "/bygghjalpen/chat",
          params: { question: text },
        })
      }
    >
      {({ hovered, pressed }) => (
        <View
          style={{
            backgroundColor:
              pressed || hovered
                ? primitives.accent100
                : primitives.neutrals100,
            borderColor:
              pressed || hovered
                ? primitives.accent500
                : primitives.secondary500,
            borderRadius: borderRadius.medium,
            borderWidth: 1,
            flexDirection: "row",
            gap: 10,
            padding: 12,
          }}
        >
          <View
            style={{
              backgroundColor: primitives.accent500,
              borderRadius: 999,
              height: 8,
              marginTop: 8,
              width: 8,
            }}
          />
          <Body style={{ flex: 1 }}>{text}</Body>
        </View>
      )}
    </Pressable>
  );
};

const HeroPattern = () => {
  return (
    <>
      {[0, 1, 2, 3].map((item) => (
        <View
          key={item}
          style={{
            borderColor: primitives.neutrals10,
            borderRadius: 999,
            borderWidth: 1,
            height: 180,
            opacity: 0.72,
            position: "absolute",
            right: -60 + item * 70,
            top: -52 + item * 22,
            transform: [{ rotate: "-18deg" }],
            width: 52,
          }}
        />
      ))}
      <View
        style={{
          backgroundColor: primitives.neutrals10,
          borderRadius: 999,
          height: 220,
          left: -120,
          opacity: 0.6,
          position: "absolute",
          top: 36,
          width: 220,
        }}
      />
    </>
  );
};
