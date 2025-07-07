import { Button } from "@components/buttons/button";
import { Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { router } from "expo-router";
import { View } from "react-native";

type Props = {
  title: string;
  onBack?: () => void;
  progress: number; //value between 0 and 100
};

export const ProgressHeader = ({
  title,
  onBack,
  progress: _progress,
}: Props) => {
  const colors = useThemeColor();
  const progress = Math.min(Math.max(0, _progress), 100);
  return (
    <View>
      <View
        style={[
          {
            flexDirection: "row",
            marginBottom: 4,
            marginTop: 8,
            alignItems: "center",
            justifyContent: "space-between",
          },
        ]}
      >
        <Title size="medium" style={{ marginVertical: 8 }}>
          {title}
        </Title>
        <View
          style={[
            {
              flexDirection: "row",
              gap: 6,
              alignItems: "center",
              marginRight: -12,
            },
          ]}
        >
          <Button
            icon="X"
            onPress={() =>
              onBack
                ? onBack()
                : router.canGoBack()
                  ? router.back()
                  : router.navigate("/")
            }
            type="text"
            style={{ marginLeft: -12 }}
          />
        </View>
      </View>
      <View
        style={{
          width: "100%",
          backgroundColor: colors.buttons.tonal.enabled,
          height: 4,
          borderRadius: borderRadius.small,
        }}
      >
        <View
          style={{
            position: "absolute",
            height: "100%",
            width: `${progress}%`,
            backgroundColor: colors.buttons.filled.enabled,
            borderRadius: borderRadius.small,
          }}
        />
      </View>
    </View>
  );
};
