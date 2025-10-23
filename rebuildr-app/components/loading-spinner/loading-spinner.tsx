import { View, ActivityIndicator, ViewStyle } from "react-native";

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
      <ActivityIndicator />
    </View>
  );
};
