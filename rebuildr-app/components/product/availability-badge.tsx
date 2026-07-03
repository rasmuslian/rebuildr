import { View, StyleProp, ViewStyle } from "react-native";
import { Label } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { primitives } from "@constants/colors";
import { UPCOMING_LABEL, formatAvailability } from "@/utils/availability";
import {
  ProductAvailabilityEnum,
  ProductAvailabilityPrecisionEnum,
} from "@/gql/graphql";

type Props = {
  availability?: ProductAvailabilityEnum | null;
  estimatedAvailableAt?: string | null;
  availabilityPrecision?: ProductAvailabilityPrecisionEnum | null;
  /** compact = just "Snart till salu" (grid). detailed = with the date. */
  variant?: "compact" | "detailed";
  style?: StyleProp<ViewStyle>;
};

export const AvailabilityBadge = ({
  availability,
  estimatedAvailableAt,
  availabilityPrecision,
  variant = "detailed",
  style,
}: Props) => {
  if (availability !== ProductAvailabilityEnum.Upcoming) return null;

  const text =
    variant === "compact"
      ? UPCOMING_LABEL
      : (formatAvailability(
          availability,
          estimatedAvailableAt,
          availabilityPrecision,
        ) ?? UPCOMING_LABEL);

  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          backgroundColor: primitives.primary700,
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: borderRadius.full,
        },
        style,
      ]}
    >
      <Label size="medium" color="primaryLight">
        {text}
      </Label>
    </View>
  );
};
