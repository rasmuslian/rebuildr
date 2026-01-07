import { Body } from "@components/typography/text";
import dayjs from "dayjs";
import { View } from "react-native";

type Props = {
  createdAt: string;
  updatedAt: string;
  isMyProduct: boolean;
  onReportPress: () => void;
};

export const InfoSection = ({
  createdAt,
  updatedAt,
  isMyProduct,
  onReportPress,
}: Props) => {
  return (
    <View>
      <Body size="medium">
        Annonsen publicerades: {dayjs(createdAt).format("D MMM, YYYY")}
      </Body>
      <Body size="medium">
        Senast ändrad: {dayjs(updatedAt).format("D MMM, YYYY")}
      </Body>
      {!isMyProduct && (
        <Body
          size="medium"
          isLink
          style={{ marginTop: 16 }}
          onPress={onReportPress}
        >
          Anmäl annonsen
        </Body>
      )}
    </View>
  );
};
