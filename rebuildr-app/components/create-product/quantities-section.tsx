import {
  QuantityUnitEnum,
  RecommendedQuantitiesQueryQuery,
  RecommendedQuantitiesQueryQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Toggle } from "@components/controls/toggle";
import { SelectInput } from "@components/forms/selectInput";
import { TextInput } from "@components/forms/textInput";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Body, Label } from "@components/typography/text";
import { quantities } from "@constants/quantities";
import { useEffect, useState } from "react";
import { View } from "react-native";

const RECOMMENDED_QUANTITIES_QUERY = gql`
  query RecommendedQuantitiesQuery($input: CategoryInput!) {
    category(input: $input) {
      id
      primaryQuantityUnit
      secondaryQuantityUnit
    }
  }
`;

type Props = {
  categoryId: string;
  primaryQuantity?: number;
  primaryUnit?: QuantityUnitEnum;
  onBlurPrimary: (args: { quantity: number; unit: QuantityUnitEnum }) => void;
  secondaryQuantity?: number;
  secondaryUnit?: QuantityUnitEnum;
  onBlurSecondary: (args: {
    quantity?: number;
    unit?: QuantityUnitEnum;
  }) => void;
};

export const QuantitiesSection = ({
  categoryId,
  primaryQuantity: _primaryQuantity,
  primaryUnit: _primaryUnit,
  onBlurPrimary,
  secondaryQuantity: _secondaryQuantity,
  secondaryUnit: _secondaryUnit,
  onBlurSecondary,
}: Props) => {
  const [primaryQuantity, setPrimaryQuantity] = useState(
    _primaryQuantity?.toString() ?? "0",
  );
  const [secondaryQuantity, setSecondaryQuantity] = useState(
    _secondaryQuantity?.toString() ?? "0",
  );

  const [showSecondary, setShowSecondary] = useState(
    _secondaryQuantity !== undefined,
  );

  const [primaryUnit, setPrimaryaryUnit] = useState<QuantityUnitEnum>(
    _primaryUnit ?? Object.values(QuantityUnitEnum)[0],
  );
  const [secondaryUnit, setSecondaryUnit] = useState<
    QuantityUnitEnum | undefined
  >(_secondaryUnit);

  useEffect(() => {
    setPrimaryQuantity(_primaryQuantity?.toString() ?? "0");
    setSecondaryQuantity(_secondaryQuantity?.toString() ?? "0");
    setShowSecondary(_secondaryQuantity !== undefined);
  }, [_primaryQuantity, _secondaryQuantity]);

  const { data } = useQuery<
    RecommendedQuantitiesQueryQuery,
    RecommendedQuantitiesQueryQueryVariables
  >(RECOMMENDED_QUANTITIES_QUERY, {
    variables: { input: { id: categoryId } },
  });

  const processQuantity = (q: string) => {
    //remove all non digits
    const newQuantity = q.replace(/\D/g, "");
    if (newQuantity.startsWith("0") && newQuantity.length > 1) {
      return newQuantity.slice(1);
    }
    return newQuantity || "0";
  };

  const onBlurQuantity = (type: "primary" | "secondary") => {
    const quantity =
      type === "primary"
        ? parseInt(primaryQuantity, 10)
        : parseInt(secondaryQuantity, 10);
    if (quantity <= 0) {
      return;
    }
    if (type === "primary") {
      return {
        quantity,
        unit:
          primaryUnit ??
          data?.category.primaryQuantityUnit ??
          QuantityUnitEnum.Amount,
      };
    }
    return {
      quantity,
      unit:
        secondaryUnit ??
        data?.category.secondaryQuantityUnit ??
        QuantityUnitEnum.Amount,
    };
  };

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <View style={{ zIndex: 10 }}>
      <View style={{ gap: 4, flex: 1 }}>
        <Label size="medium">Antal och enhet</Label>
        <Body size="medium">
          Ange antal eller mängd för produkten i relevanta enheter.
        </Body>
      </View>
      <View
        style={{ flexDirection: "row", gap: 16, zIndex: 10, marginTop: 16 }}
      >
        <View style={{ minWidth: 213 }}>
          <TextInput
            value={primaryQuantity}
            onChange={(t) => setPrimaryQuantity(processQuantity(t))}
            onBlur={() => {
              const primaryObject = onBlurQuantity("primary");
              if (!primaryObject) {
                return;
              }
              onBlurPrimary(primaryObject);
            }}
            inputType="numeric"
          />
        </View>
        <View style={{ flex: 1 }}>
          <SelectInput
            value={
              primaryUnit ??
              data.category.primaryQuantityUnit ??
              QuantityUnitEnum.Amount
            }
            options={Object.values(QuantityUnitEnum).map((option) => ({
              value: option,
              label: quantities[option].short,
              disabled: option === secondaryUnit,
            }))}
            onSelect={(value) => setPrimaryaryUnit(value as QuantityUnitEnum)}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          marginTop: 24,
          gap: 24,
          alignItems: "flex-end",
        }}
      >
        <View style={{ gap: 4, flex: 1 }}>
          <Label size="medium">Lägg till ytterligare enhet</Label>
          <Body size="medium">
            Lägg till ytterligare enehet för att beskriva produkten
          </Body>
        </View>
        <Toggle
          value={showSecondary}
          onPress={() => {
            //remove secondary if showSecondary is true, since it will now be removed from product
            if (showSecondary) {
              onBlurSecondary({});
              setSecondaryUnit(undefined);
            }
            setSecondaryUnit(
              _secondaryUnit ??
                data.category.secondaryQuantityUnit ??
                (Object.values(QuantityUnitEnum).find(
                  (unit) => unit !== primaryUnit,
                ) as QuantityUnitEnum),
            );
            setShowSecondary(!showSecondary);
          }}
        />
      </View>
      {showSecondary && (
        <View
          style={{ flexDirection: "row", marginTop: 16, gap: 16, zIndex: 9 }}
        >
          <View style={{ minWidth: 213 }}>
            <TextInput
              value={secondaryQuantity}
              onChange={(t) => setSecondaryQuantity(processQuantity(t))}
              onBlur={() => {
                const secondaryObject = onBlurQuantity("secondary");
                if (!secondaryObject) {
                  return;
                }
                onBlurPrimary(secondaryObject);
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <SelectInput
              value={
                secondaryUnit ??
                data.category.secondaryQuantityUnit ??
                QuantityUnitEnum.M2
              }
              options={Object.values(QuantityUnitEnum).map((option, i) => ({
                value: option,
                label: quantities[option].short,
                disabled: option === primaryUnit,
              }))}
              onSelect={(value) => setSecondaryUnit(value as QuantityUnitEnum)}
            />
          </View>
        </View>
      )}
    </View>
  );
};
