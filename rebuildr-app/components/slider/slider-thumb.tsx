import { themeColorTokens } from "@constants/colors";
import { borderRadius } from "@constants/sizes";
import { Icon } from "@icons/icon";
import { ViewStyle } from "react-native";
import { GestureDetector, PanGesture } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

type Props = {
  gestureHandler: PanGesture;
  positionStyle: ViewStyle;
};

export const SliderThumb = ({ gestureHandler, positionStyle }: Props) => {
  const colors = themeColorTokens.dark;
  return (
    <GestureDetector gesture={gestureHandler}>
      <Animated.View
        style={[
          {
            width: 40,
            height: 40,
            backgroundColor: colors.buttons.filled.enabled,
            borderRadius: borderRadius.medium,
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: -12,
            bottom: 0,
            boxShadow: "0px 4px 16px 0px #00000015",
          },
          positionStyle,
        ]}
      >
        <Icon icon="drag" size={18} customColor={colors.text.primaryLight} />
      </Animated.View>
    </GestureDetector>
  );
};
