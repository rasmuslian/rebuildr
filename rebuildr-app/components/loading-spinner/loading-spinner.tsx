import { View, ViewStyle } from "react-native";
import LottieView from "lottie-react-native";

type Props = {
  style?: ViewStyle;
};
export const LoadingSpinner = ({ style }: Props) => {
  return (
    <View
      style={[
        { flex: 1, justifyContent: "center", alignItems: "center" },
        style,
      ]}
    >
      <LottieView
        source={require("../../assets/images/loader-rebuildr.lottie")}
        autoPlay
        loop
        style={{ width: 100, height: 100 }}
      />
    </View>
  );
};
