import { Image, ImageBackground, ImageSource } from "expo-image";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import LogoIconLight from "@assets/svgs/logo-icon-light.svg";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Button } from "@components/buttons/button";
import { Popup } from "@components/popup/popup";
import { Body, Headline, Label } from "@components/typography/text";
import { primitives } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { Icon } from "@icons/icon";
import {
  LoginModalContext,
  LoginModalIntent,
} from "@context/loginModalContext";
import { useCookies } from "@hooks/use-cookies";
import { useOnboarding } from "@hooks/use-onboarding";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";

type Slide = {
  key: string;
  media: { kind: "brand" } | { kind: "photo"; source: ImageSource | null };
  title: string;
  body: string;
  footer: "next" | "account";
};

const SLIDES: Slide[] = [
  {
    key: "welcome",
    media: { kind: "brand" },
    title: "Välkommen till RebuildR",
    body: "Sveriges marknadsplats för återbrukat byggmaterial & verktyg.",
    footer: "next",
  },
  {
    key: "ai",
    media: {
      kind: "photo",
      source: require("@assets/images/onboarding-ai.jpeg"),
    },
    title: "Köp och sälj med stöd av AI",
    body: "Fota varan, så skriver vår AI annonsen åt dig text, kategori och prisförslag. Sök som du pratar, så hittar du rätt.",
    footer: "next",
  },
  {
    key: "aterbyggaren",
    media: {
      kind: "photo",
      source: require("@assets/images/onboarding-aterbyggaren.jpeg"),
    },
    title: "Fråga Återbyggaren",
    body: "Altan, uterum eller badrum? Beskriv ditt projekt, så får du en materiallista och ser vad som finns återbrukat nära dig.",
    footer: "next",
  },
  {
    key: "account",
    media: {
      kind: "photo",
      source: require("@assets/images/onboarding-account.jpeg"),
    },
    title: "Skapa ditt konto",
    body: "Ett konto för att både köpa och sälja. Gratis att skapa och annonsera.",
    footer: "account",
  },
];

const Dots = ({
  count,
  active,
  progress,
}: {
  count: number;
  active: number;
  progress: Animated.Value;
}) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
    {Array.from({ length: count }, (_, i) => {
      if (i !== active) {
        return (
          <View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: borderRadius.full,
              backgroundColor: primitives.neutrals400,
            }}
          />
        );
      }
      return (
        <View
          key={i}
          style={{
            width: 24,
            height: 8,
            borderRadius: borderRadius.full,
            backgroundColor: primitives.neutrals400,
            overflow: "hidden",
          }}
        >
          {/* scaleX instead of width: 24 whole-pixel width steps over five
              seconds read as visible jumps, while a transform interpolates
              sub-pixel and stays smooth. The track clips the stretched caps. */}
          <Animated.View
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: primitives.primary700,
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-12, 0],
                  }),
                },
                {
                  scaleX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.0001, 1],
                  }),
                },
              ],
            }}
          />
        </View>
      );
    })}
  </View>
);

const SlideMedia = ({ slide, height }: { slide: Slide; height: number }) => {
  const title = (
    <Headline
      size="small"
      color="primaryLight"
      style={{ textAlign: "center", paddingHorizontal: 24 }}
    >
      {slide.title}
    </Headline>
  );

  if (slide.media.kind === "photo" && slide.media.source) {
    return (
      <ImageBackground
        source={slide.media.source}
        contentFit="cover"
        cachePolicy="memory-disk"
        alt={slide.title}
        style={{ height, justifyContent: "center" }}
      >
        {title}
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require("@assets/images/main-background.png")}
      contentFit="cover"
      style={{
        height,
        backgroundColor: primitives.primary800,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
      }}
    >
      {slide.media.kind === "brand" && (
        <Image source={LogoIconLight} style={{ width: 96, height: 96 }} />
      )}
      {title}
    </ImageBackground>
  );
};

export const OnboardingWelcome = () => {
  const { isReady, hasSeenWelcome, markWelcomeSeen } = useOnboarding();
  const { isReady: cookiesReady, hasAnswered } = useCookies();
  const { setVisible: setLoginVisible } = useContext(LoginModalContext);
  const { isDesktop } = useScreenType();
  const { height } = useWindowDimensions();
  const colors = useThemeColor();
  const [show, setShow] = useState(false);
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

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

  const openRegistration = (intent: LoginModalIntent) => {
    dismiss();
    setLoginVisible(true, { intent });
  };

  const goTo = (next: number) => {
    // The loop back to the first slide snaps instantly — animating backwards
    // through every slide reads as a glitch rather than a restart. Forward
    // moves leave `index` to the scroll handler so the UI flips exactly once,
    // halfway through the transition, instead of fighting the animation.
    listRef.current?.scrollToOffset({
      offset: next * width,
      animated: next !== 0,
    });
    if (next === 0) setIndex(0);
  };

  const goNext = () => goTo(Math.min(index + 1, SLIDES.length - 1));

  // Story-style autoplay: the active dot fills over five seconds, then the
  // deck advances, looping back to the start after the last slide. Any manual
  // step (button or swipe) changes `index` and restarts the timer.
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!show || width === 0) return;
    progress.setValue(0);
    const timer = Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    timer.start(({ finished }) => {
      if (finished) goTo((index + 1) % SLIDES.length);
    });
    return () => timer.stop();
  }, [show, width, index]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width === 0) return;
    const nearest = Math.round(event.nativeEvent.contentOffset.x / width);
    const clamped = Math.max(0, Math.min(nearest, SLIDES.length - 1));
    if (clamped !== index) setIndex(clamped);
  };

  // A fixed-height media header  // A fixed-height media header cannot use the old shrink-the-logo trick, so
  // short windows get a shorter header instead.
  const mediaHeight = height < 700 ? 180 : 220;

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={{ width }}>
      <SlideMedia slide={item} height={mediaHeight} />
      <View
        style={{
          paddingHorizontal: 28,
          paddingTop: 24,
          gap: 20,
          minHeight: 150,
        }}
      >
        <Body size="large" color="secondary" style={{ textAlign: "center" }}>
          {item.body}
        </Body>
        {item.footer === "account" && (
          <View
            style={{ flexDirection: "row", justifyContent: "center", gap: 16 }}
          >
            <Button
              label="Företag"
              onPress={() => openRegistration("business")}
              style={{ flex: 1, maxWidth: 220 }}
            />
            <Button
              label="Privat"
              onPress={() => openRegistration("private")}
              style={{ flex: 1, maxWidth: 220 }}
            />
          </View>
        )}
      </View>
    </View>
  );

  const isAccountSlide = SLIDES[index].footer === "account";

  const content = (
    <View
      style={{
        borderRadius: isDesktop ? 28 : undefined,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: "hidden",
        backgroundColor: colors.background.secondary,
      }}
    >
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <FlatList
            ref={listRef}
            data={SLIDES}
            keyExtractor={(item) => item.key}
            renderItem={renderSlide}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            onScroll={onScroll}
            scrollEventThrottle={16}
            initialNumToRender={SLIDES.length}
            windowSize={21}
            removeClippedSubviews={false}
            getItemLayout={(_, i) => ({
              length: width,
              offset: width * i,
              index: i,
            })}
          />
        )}
      </View>
      <View
        style={{
          // Fixed: the arrow button (44) and the account slide's text link
          // occupy the same row, and any difference makes the sheet hop
          // between slides.
          height: 84,
          paddingHorizontal: 28,
          justifyContent: "center",
        }}
      >
        <View style={{ position: "absolute", left: 28 }}>
          <Dots count={SLIDES.length} active={index} progress={progress} />
        </View>
        {isAccountSlide ? (
          <Body
            size="medium"
            isLink
            onPress={dismiss}
            style={{ textAlign: "center" }}
          >
            Titta runt först
          </Body>
        ) : (
          <Pressable
            onPress={goNext}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <Label size="large">Nästa</Label>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: borderRadius.full,
                backgroundColor: primitives.neutrals600,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon="arrowRight" color="primaryLight" size={18} />
            </View>
          </Pressable>
        )}
      </View>
      <Pressable
        onPress={dismiss}
        hitSlop={8}
        accessibilityLabel="Stäng introduktionen"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: borderRadius.full,
          backgroundColor: "rgba(30, 30, 30, 0.55)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon icon="X" color="primaryLight" size={16} />
      </Pressable>
    </View>
  );

  if (!isReady) return null;

  if (isDesktop) {
    return (
      <Popup open={show} onClose={dismiss} type="partial" width={440}>
        {content}
      </Popup>
    );
  }

  return (
    <BottomSheet
      name="onboarding-welcome"
      open={show}
      onDismiss={dismiss}
      noPaddingHorizontal
      backgroundColor={colors.background.secondary}
    >
      {content}
    </BottomSheet>
  );
};
