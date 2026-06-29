import { Pressable, View } from "react-native";
import dayjs from "dayjs";
import { Body, Label } from "@components/typography/text";
import { DateField } from "@components/forms/date-field";
import { borderRadius, strokeWidth } from "@constants/sizes";
import { primitives } from "@constants/colors";
import { ProductFields } from "./types";
import {
  ProductAvailabilityEnum,
  ProductAvailabilityPrecisionEnum,
} from "@/gql/graphql";

type Props = {
  product: ProductFields;
  update: (product: Partial<ProductFields>) => void;
  error?: string;
};

/**
 * "Tillgänglighet" step section: choose whether the listing is available now
 * (default) or "Snart till salu" with an exact start date and an optional end
 * date after which the ad is automatically taken down.
 */
export const AvailabilitySection = ({ product, update, error }: Props) => {
  const isUpcoming = product.availability === ProductAvailabilityEnum.Upcoming;

  const setAvailableNow = () =>
    update({
      availability: ProductAvailabilityEnum.Available,
      estimatedAvailableAt: null,
      availabilityPrecision: null,
      availableUntil: null,
    });

  const setUpcoming = () =>
    update({
      availability: ProductAvailabilityEnum.Upcoming,
      // New listings always use an exact date.
      availabilityPrecision: ProductAvailabilityPrecisionEnum.Exact,
    });

  return (
    <View
      style={{
        gap: 12,
        borderWidth: strokeWidth.regular,
        borderColor: primitives.neutrals200,
        borderRadius: borderRadius.medium,
        padding: 16,
      }}
    >
      <Label size="large">Tillgänglighet</Label>
      {/* Green = selected status (per the Rebuildr style reference); purple is
          reserved for the step's primary CTA, not status toggles. */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <SegmentOption
          label="Tillgänglig nu"
          selected={!isUpcoming}
          onPress={setAvailableNow}
        />
        <SegmentOption
          label="Snart till salu"
          selected={isUpcoming}
          onPress={setUpcoming}
        />
      </View>

      {isUpcoming && (
        <View style={{ gap: 16 }}>
          <DateField
            label="Tillgänglig från"
            value={product.estimatedAvailableAt}
            placeholder="Välj startdatum"
            minDate={dayjs().format("YYYY-MM-DD")}
            error={error}
            onChange={(d) =>
              update({
                estimatedAvailableAt: dayjs(d).toISOString(),
                availabilityPrecision: ProductAvailabilityPrecisionEnum.Exact,
              })
            }
          />
          <DateField
            label="Annonsen tas bort (valfritt)"
            value={product.availableUntil}
            placeholder="Inget slutdatum"
            minDate={
              product.estimatedAvailableAt ?? dayjs().format("YYYY-MM-DD")
            }
            onChange={(d) =>
              update({ availableUntil: dayjs(d).endOf("day").toISOString() })
            }
            onClear={() => update({ availableUntil: null })}
          />
          <Body size="small" color="secondary">
            Synlig för planering innan den är tillgänglig. Sätt ett slutdatum om
            annonsen ska tas bort automatiskt.
          </Body>
        </View>
      )}
    </View>
  );
};

const SegmentOption = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    style={{
      flex: 1,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: borderRadius.medium,
      borderWidth: strokeWidth.regular,
      borderColor: selected ? primitives.primary700 : primitives.neutrals400,
      backgroundColor: selected
        ? primitives.primary700
        : primitives.neutrals100,
    }}
  >
    <Label size="large" color={selected ? "primaryLight" : "primaryDark"}>
      {label}
    </Label>
  </Pressable>
);
