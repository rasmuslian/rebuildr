import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { Title } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { useRef, useEffect, PropsWithChildren, ReactElement } from "react";
import {
  Animated,
  ScrollView,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { Pressable } from "react-native-gesture-handler";

type Props = {
  open: boolean;
  onClose?: () => void;
  onBack?: () => void;
  title?: string;
  style?: ViewStyle;
  footer?: ReactElement;
} & PropsWithChildren;

export const SlideInSheet = ({
  open,
  onClose,
  onBack,
  children,
  title,
  style,
  footer,
}: Props) => {
  const colors = useThemeColor();
  const { width: screenWidth } = useWindowDimensions();
  const { isDesktop } = useScreenType();
  const width = isDesktop ? 500 : screenWidth;
  const slideAnim = useRef(new Animated.Value(width)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: open ? 0 : width,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(fadeAnim, {
      toValue: open ? 0.3 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [open]);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
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
        <Pressable
          onPress={onClose}
          style={{ width: "100%", height: "100%" }}
        />
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width,
            backgroundColor: colors.background.neutral,
            elevation: 5,
            paddingBottom: 20,
          }}
        >
          {(title || onBack) && (
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
          )}
          <ScrollView
            style={[{ paddingTop: 24 }, style]}
            contentContainerStyle={[
              { paddingHorizontal: isDesktop ? 48 : 16 },
              style,
            ]}
          >
            {children}
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
  );
};
