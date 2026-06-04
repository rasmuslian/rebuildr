import { borderRadius } from "@constants/sizes";
import { useEffect, useRef } from "react";
import { Animated, Easing, Image, View, ViewStyle } from "react-native";

type Props = {
  style?: ViewStyle;
};

export const LoadingSpinner = ({ style }: Props) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ).start();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={[
        { flex: 1, justifyContent: "center", alignItems: "center" },
        style,
      ]}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: borderRadius.xSmall,
          backgroundColor: "rgba(0,0,0,0.28)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image
            source={require("../../assets/images/loader-icon.png")}
            style={{ width: 90, height: 90 }}
          />
        </Animated.View>
      </View>
    </View>
  );
};
