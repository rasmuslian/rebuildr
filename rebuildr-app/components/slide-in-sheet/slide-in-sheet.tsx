import { Button } from "@components/buttons/button";
import { Title } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { useRef, useEffect, PropsWithChildren } from "react";
import { Animated, View, Dimensions, ViewStyle } from "react-native";
import { Pressable } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");
type Props = {
  open: boolean;
  onClose?: () => void;
  onBack?: () => void;
  title: string;
  style?: ViewStyle;
} & PropsWithChildren;

export const SlideInSheet = ({
  open,
  onClose,
  onBack,
  children,
  title,
  style,
}: Props) => {
  const colors = useThemeColor();
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: open ? 0 : width,
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
          zIndex: 1000,
        },
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
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
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderColor: colors.dividers.neutral,
            marginBottom: 24,
            marginTop: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {onBack && (
              <Pressable onPress={onBack}>
                <Icon icon="arrowLeft" size={18} />
              </Pressable>
            )}
            <Title size="medium">{title}</Title>
          </View>
          <Button icon="X" onPress={onClose} type="text" />
        </View>
        <View style={style}>{children}</View>
      </View>
    </Animated.View>
  );
};
