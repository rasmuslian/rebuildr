import { useThemeColor } from "@hooks/useThemeColor";
import { router } from "expo-router";
import { PropsWithChildren } from "react";
import { Pressable, View } from "react-native";

export const TransparentModal = ({ children }: PropsWithChildren) => {
  const colors = useThemeColor();

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.dismiss();
    }
  };

  return (
    <View
      style={[
        {
          position: "absolute",
          overflow: "hidden",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      ]}
    >
      <Pressable onPress={goBack} style={{ width: "100%", height: "100%" }} />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 500,
          backgroundColor: colors.background.neutral,
          elevation: 5,
          paddingBottom: 20,
          paddingHorizontal: 48,
        }}
      >
        {children}
      </View>
    </View>
  );
};
