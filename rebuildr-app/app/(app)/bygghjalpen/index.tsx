import { router, useFocusEffect } from "expo-router";
import Head from "expo-router/head";
import { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { BygghjalpenPromptBox } from "@components/bygghjalpen/prompt-box";
import TopBar from "@components/navigation/top-bar/top-bar";
import { Body, Headline, Label } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { horizontalPadding } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";

const questionExamples = [
  "Vad behöver jag för att bygga en altan?",
  "Hur bygger jag ett uterum?",
  "Hur stor del av mitt badrum kan jag bygga återbrukat?",
  "Vilka fönster finns återbrukat nära mig?",
];

export default function BygghjalpenLandingPage() {
  const { isDesktop } = useScreenType();
  const colors = useThemeColor();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [question, setQuestion] = useState("");
  const topBarHeight = isDesktop ? 72 : 56;
  const pageHeight = Math.max(windowHeight - topBarHeight, 0);
  const openChat = useCallback((initialQuestion?: string) => {
    const trimmedQuestion = initialQuestion?.trim();

    if (trimmedQuestion) {
      router.navigate(
        `/bygghjalpen/chat?question=${encodeURIComponent(trimmedQuestion)}`,
      );
      return;
    }

    router.navigate("/bygghjalpen/chat");
  }, []);

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
        <title>RebuildR - Återbyggaren</title>
        <meta
          name="description"
          content="Återbyggaren visar hur mycket av ditt projekt du kan bygga återbrukat med material på RebuildR nära dig."
        />
      </Head>

      <View
        style={{
          backgroundColor: primitives.primary800,
          flex: 1,
          height: windowHeight,
          overflow: "hidden",
        }}
      >
        <TopBar theme="dark" showSearchBar={false} />
        <View
          style={{
            flex: 1,
            minHeight: pageHeight,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <MainBackground
            isDesktop={isDesktop}
            parentHeight={pageHeight}
            parentWidth={windowWidth}
          />
          <View
            style={{
              alignSelf: "center",
              maxWidth: 640,
              paddingHorizontal: isDesktop ? 0 : horizontalPadding.mobile,
              paddingTop: isDesktop ? 58 : 55,
              position: "relative",
              width: "100%",
              zIndex: 1,
            }}
          >
            <Headline
              size={isDesktop ? "large" : "large"}
              heading={1}
              style={{
                color: primitives.primary200,
                textAlign: isDesktop ? "center" : "left",
              }}
            >
              Återbyggaren{" "}
              <Text style={{ color: primitives.primary400 }}>
                visar hur mycket av ditt projekt du kan bygga återbrukat
              </Text>
            </Headline>

            <Body
              size={isDesktop ? "large" : "medium"}
              style={{
                color: primitives.primary200,
                marginTop: isDesktop ? 23 : 20,
                maxWidth: 640,
                textAlign: isDesktop ? "center" : "left",
              }}
            >
              Beskriv ditt projekt. Återbyggaren guidar dig kring vad du ska
              bygga, vilka material du behöver – och hur mycket som finns
              återbrukat på RebuildR nära dig.
            </Body>

            <BygghjalpenPromptBox
              value={question}
              onChangeText={setQuestion}
              onSubmit={() => openChat(question)}
              style={{ marginTop: isDesktop ? 30 : 12 }}
            />

            <View
              style={{
                backgroundColor: colors.dividers.primary,
                height: 1,
                marginTop: isDesktop ? 23 : 33,
                width: "100%",
              }}
            />

            <View style={{ marginTop: 14 }}>
              <Label size="small" style={{ color: colors.dividers.primary }}>
                Exempel på frågor till Återbyggaren:
              </Label>
              <View
                style={{
                  alignItems: isDesktop ? "flex-start" : "center",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: isDesktop ? 12 : 11,
                  marginTop: isDesktop ? 9 : 13,
                }}
              >
                {questionExamples.map((example) => (
                  <QuestionChip
                    key={example}
                    text={example}
                    onPress={() => openChat(example)}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const backgroundAspectRatio = 1440 / 487;

const MainBackground = ({
  isDesktop,
  parentHeight,
  parentWidth,
}: {
  isDesktop: boolean;
  parentHeight: number;
  parentWidth: number;
}) => {
  const desktopWidth = Math.max(parentWidth * 1.36, parentHeight * 2.15, 1680);
  const mobileWidth = Math.max(parentWidth * 1.58, parentHeight * 1.3, 840);
  const imageWidth = isDesktop ? desktopWidth : mobileWidth;
  const imageHeight = imageWidth / backgroundAspectRatio;

  return (
    <View
      style={{
        bottom: 0,
        left: 0,
        pointerEvents: "none",
        position: "absolute",
        right: 0,
        top: 0,
      }}
    >
      <Image
        source={require("@assets/images/main-background.png")}
        resizeMode="cover"
        style={{
          height: imageHeight,
          position: "absolute",
          right: -imageWidth * (isDesktop ? 0.43 : 0.42),
          top: isDesktop ? parentHeight * 0.06 : 405,
          transform: [{ rotate: isDesktop ? "-43deg" : "-35deg" }],
          width: imageWidth,
        }}
      />
    </View>
  );
};

const QuestionChip = ({
  onPress,
  text,
}: {
  onPress: () => void;
  text: string;
}) => {
  const colors = useThemeColor();

  return (
    <Pressable onPress={onPress} style={{ maxWidth: "100%" }}>
      {({ hovered, pressed }) => (
        <View
          style={{
            borderColor:
              hovered || pressed ? primitives.primary300 : colors.text.success,
            borderRadius: 4,
            borderWidth: 1,
            maxWidth: "100%",
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Label
            style={{
              color: colors.text.primaryLight,
              flexShrink: 1,
              fontWeight: "500",
            }}
          >
            {text}
          </Label>
        </View>
      )}
    </Pressable>
  );
};
