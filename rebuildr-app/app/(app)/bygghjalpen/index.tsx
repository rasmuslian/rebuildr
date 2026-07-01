import { router, useFocusEffect } from "expo-router";
import Head from "expo-router/head";
import { Image as ExpoImage } from "expo-image";
import { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import SendVector from "@assets/svgs/send-vector.svg";
import TopBar from "@components/navigation/top-bar/top-bar";
import { Body, Headline, Label } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { useScreenType } from "@hooks/useScreenType";
import { Icon } from "@icons/icon";

const desktopQuestionExamples = [
  "Vad behöver jag för att bygga en altan?",
  "Hur bygger jag ett uterum?",
  "Hur stor del av mitt badrum kan jag bygga återbrukat?",
  "Vilka fönster finns återbrukat nära mig?",
];

const mobileQuestionExamples = [
  "Vad behöver jag för att bygga en altan?",
  "Hur stor del av mitt badrum kan jag bygga återbrukat?",
  "Vilka fönster finns återbrukat nära mig?",
  "Hur bygger jag ett uterum?",
];

export default function BygghjalpenLandingPage() {
  const { isDesktop } = useScreenType();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const [question, setQuestion] = useState("");
  const topBarHeight = isDesktop ? 72 : 56;
  const pageHeight = Math.max(windowHeight - topBarHeight, 0);
  const questionExamples = isDesktop
    ? desktopQuestionExamples
    : mobileQuestionExamples;

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
              maxWidth: 480,
              paddingHorizontal: isDesktop ? 0 : 24,
              paddingTop: isDesktop ? 58 : 55,
              position: "relative",
              width: "100%",
              zIndex: 1,
            }}
          >
            <Headline
              size={isDesktop ? "medium" : "large"}
              heading={1}
              style={{
                color: primitives.secondary200,
                textAlign: isDesktop ? "center" : "left",
              }}
            >
              Återbyggaren{" "}
              <Text style={{ color: primitives.primary300 }}>
                visar hur mycket av ditt projekt du kan bygga återbrukat
              </Text>
            </Headline>

            <Body
              size="small"
              style={{
                color: primitives.secondary200,
                marginTop: isDesktop ? 23 : 20,
                maxWidth: isDesktop ? 470 : 335,
                textAlign: isDesktop ? "center" : "left",
              }}
            >
              Beskriv ditt projekt. Återbyggaren guidar dig kring vad du ska
              bygga, vilka material du behöver – och hur mycket som finns
              återbrukat på RebuildR nära dig.
            </Body>

            <View
              style={{
                backgroundColor: primitives.neutrals100,
                borderRadius: isDesktop ? 8 : 9,
                height: isDesktop ? 123 : 162,
                marginTop: isDesktop ? 30 : 12,
                paddingBottom: isDesktop ? 12 : 14,
                paddingHorizontal: isDesktop ? 12 : 18,
                paddingTop: isDesktop ? 12 : 18,
                width: "100%",
              }}
            >
              <TextInput
                value={question}
                onChangeText={setQuestion}
                placeholder="Ställ din fråga här"
                placeholderTextColor={primitives.neutrals800}
                multiline
                style={{
                  color: primitives.neutrals900,
                  flex: 1,
                  fontFamily: "Inter-Regular",
                  fontSize: 14,
                  lineHeight: 20,
                  outlineColor: "transparent",
                  outlineWidth: 0,
                  padding: 0,
                  textAlignVertical: "top",
                }}
              />
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", gap: isDesktop ? 8 : 10 }}>
                  <PromptIconButton icon="paperclip" />
                  <PromptIconButton icon="addPhoto" />
                </View>
                <SendButton onPress={() => openChat(question)} />
              </View>
            </View>

            <View
              style={{
                backgroundColor: primitives.neutrals50,
                height: 1,
                marginTop: isDesktop ? 23 : 33,
                width: "100%",
              }}
            />

            <View style={{ marginTop: 14 }}>
              <Label size="small" style={{ color: primitives.primary300 }}>
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

const SendButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <Pressable
      accessibilityLabel="Skicka fråga"
      accessibilityRole="button"
      onPress={onPress}
    >
      {({ hovered, pressed }) => (
        <View
          style={{
            alignItems: "center",
            backgroundColor:
              hovered || pressed ? primitives.accent400 : primitives.accent500,
            borderRadius: 999,
            height: 32,
            justifyContent: "center",
            opacity: pressed ? 0.88 : 1,
            width: 32,
          }}
        >
          <ExpoImage
            source={SendVector.uri}
            style={{ height: 14, width: 16 }}
          />
        </View>
      )}
    </Pressable>
  );
};

const PromptIconButton = ({ icon }: { icon: "paperclip" | "addPhoto" }) => {
  return (
    <Pressable
      accessibilityLabel={
        icon === "paperclip" ? "Bifoga fil" : "Lägg till bild"
      }
      accessibilityRole="button"
    >
      {({ hovered, pressed }) => (
        <View
          style={{
            alignItems: "center",
            height: 24,
            justifyContent: "center",
            opacity: hovered || pressed ? 0.7 : 1,
            width: 24,
          }}
        >
          <Icon icon={icon} customColor={primitives.neutrals600} size={22} />
        </View>
      )}
    </Pressable>
  );
};

const QuestionChip = ({
  onPress,
  text,
}: {
  onPress: () => void;
  text: string;
}) => {
  return (
    <Pressable onPress={onPress}>
      {({ hovered, pressed }) => (
        <View
          style={{
            borderColor:
              hovered || pressed
                ? primitives.primary300
                : primitives.primary400,
            borderRadius: 4,
            borderWidth: 1,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Label
            size="large"
            style={{
              color: primitives.neutrals100,
              textAlign: "center",
            }}
          >
            {text}
          </Label>
        </View>
      )}
    </Pressable>
  );
};
