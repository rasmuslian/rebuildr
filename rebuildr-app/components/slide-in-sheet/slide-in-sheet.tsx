import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { Title } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import {
  useEffect,
  PropsWithChildren,
  ReactElement,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  Animated,
  ScrollView,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { Portal } from "@gorhom/portal";
import { usePathname } from "expo-router";

type Props = {
  open: boolean;
  onClose?: () => void;
  onBack?: () => void;
  title?: string;
  style?: ViewStyle;
  footer?: ReactElement;
  bottomMargin?: number;
  contentWaitOnAnimation?: boolean;
} & PropsWithChildren;

export const SlideInSheet = ({
  open,
  onClose,
  onBack,
  children,
  title,
  style,
  footer,
  bottomMargin = 20,
  contentWaitOnAnimation,
}: Props) => {
  const [showContent, setShowContent] = useState(!contentWaitOnAnimation);
  const key = useMemo(() => `slide-in-sheet-${Math.random().toString(8)}`, []);
  const colors = useThemeColor();
  const { width: screenWidth } = useWindowDimensions();
  const { isDesktop } = useScreenType();
  const width = isDesktop ? 500 : screenWidth;
  const animationTime = 300;

  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [displayState, setDisplayState] = useState<"none" | "flex">("none");
  const initialRef = useRef(true);
  const pathname = usePathname();

  useEffect(() => {
    if (initialRef.current) {
      return;
    }
    if (open) {
      onClose?.();
    }
  }, [pathname]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: open ? 0 : width,
      duration: animationTime,
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: open ? 0.3 : 0,
      duration: animationTime,
      useNativeDriver: true,
    }).start();

    if (contentWaitOnAnimation) {
      setTimeout(() => setShowContent(open), animationTime);
    }

    if (open) {
      setDisplayState("flex");
    } else {
      if (initialRef.current) {
        initialRef.current = false;
        return;
      }
      setTimeout(() => {
        setDisplayState("none");
      }, animationTime);
    }
  }, [open]);

  return (
    <Portal key={key} hostName="OverlayProvider">
      <Animated.View
        style={[
          {
            position: "absolute",
            overflow: "hidden",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: open ? "auto" : "none",
          },
          {
            backgroundColor: fadeAnim.interpolate({
              inputRange: [0, 0.5],
              outputRange: ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5)"],
            }),
          },
        ]}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
            },
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/**Content of a SlideInSheet */}
          <Pressable
            onPress={onClose}
            style={{ width: "100%", height: "100%" }}
          />
          <View
            style={[
              {
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width,
                backgroundColor: colors.background.neutral,
                elevation: 5,
                paddingBottom: bottomMargin,
              },
              {
                display: displayState,
              },
            ]}
          >
            {(title || onBack) && (
              <SlideInHeader title={title} onBack={onBack} onClose={onClose} />
            )}
            <ScrollView
              style={[{ paddingTop: 24 }, style]}
              contentContainerStyle={[
                { paddingHorizontal: isDesktop ? 48 : 16 },
                style,
              ]}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {showContent && children}
            </ScrollView>
            {footer && (
              <View
                style={{
                  paddingHorizontal: isDesktop ? 48 : 16,
                  marginBottom: 32,
                }}
              >
                {footer}
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Portal>
  );
};

type SlideInHeaderProps = {
  title?: string;
  onBack?: () => void;
  onClose?: () => void;
};

export const SlideInHeader = ({
  title,
  onBack,
  onClose,
}: SlideInHeaderProps) => {
  const { isDesktop } = useScreenType();
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: 8,
          paddingHorizontal: isDesktop ? 48 : 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          {onBack && (
            <Pressable onPress={onBack} style={{ paddingRight: 16 }}>
              <Icon icon="arrowLeft" size={18} />
            </Pressable>
          )}
          {title && <Title size="medium">{title}</Title>}
        </View>
        <Button icon="X" onPress={onClose} type="text" />
      </View>
      <View style={{ paddingHorizontal: isDesktop ? 48 : 16 }}>
        <Divider />
      </View>
    </>
  );
};
