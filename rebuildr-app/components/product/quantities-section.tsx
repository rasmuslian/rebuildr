import {
  QuantityUnitEnum,
  RecommendedQuantitiesQueryQuery,
  RecommendedQuantitiesQueryQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
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
  primaryError?: string;
  onChangePrimary: (args: { quantity: number; unit: QuantityUnitEnum }) => void;
  secondaryQuantity?: number;
  secondaryUnit?: QuantityUnitEnum;
  onChangeSecondary: (args: {
    quantity?: number;
    unit?: QuantityUnitEnum;
  }) => void;
};

export const QuantitiesSection = ({
  categoryId,
  primaryQuantity: _primaryQuantity,
  primaryUnit: _primaryUnit,
  primaryError,
  onChangePrimary,
  secondaryQuantity: _secondaryQuantity,
  secondaryUnit: _secondaryUnit,
  onChangeSecondary,
}: Props) => {
  const [primaryQuantity, setPrimaryQuantity] = useState(
    _primaryQuantity?.toString() ?? "0",
  );

  const [secondaryQuantity, setSecondaryQuantity] = useState(
    _secondaryQuantity?.toString() ?? "0",
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
  }, [_primaryQuantity, _secondaryQuantity]);

  const { data } = useQuery<
    RecommendedQuantitiesQueryQuery,
    RecommendedQuantitiesQueryQueryVariables
  >(RECOMMENDED_QUANTITIES_QUERY, {
    variables: { input: { id: categoryId } },
  });

  useEffect(() => {
    onChangeSecondary({
      quantity: undefined,
      unit: undefined,
    });
  }, [categoryId]);

  const onChangeUnit = (
    unit: QuantityUnitEnum,
    field: "primary" | "secondary",
  ) => {
    if (field === "primary") {
      onChangePrimary({
        quantity: parseInt(primaryQuantity, 10),
        unit,
      });
      setPrimaryaryUnit(unit);
    }
    if (field === "secondary") {
      onChangeSecondary({
        quantity: parseInt(secondaryQuantity, 10),
        unit,
      });
      setSecondaryUnit(unit);
    }
  };
  const processQuantity = (q: string) => {
    //remove all non digits
    const newQuantity = q.replace(/\D/g, "");
    if (newQuantity.startsWith("0") && newQuantity.length > 1) {
      return newQuantity.slice(1);
    }
    return newQuantity || "0";
  };

  const onChangePrimaryQuantity = (q: string) => {
    const processed = processQuantity(q);
    setPrimaryQuantity(processed);
    const quantity = parseInt(processed, 10);
    onChangePrimary({
      quantity,
      unit:
        primaryUnit ??
        data?.category.primaryQuantityUnit ??
        QuantityUnitEnum.Amount,
    });
  };
  const onChangeSecondaryQuantity = (q: string) => {
    const processed = processQuantity(q);
    setSecondaryQuantity(processed);
    const quantity = parseInt(processed, 10);
    if (quantity <= 0) {
      return;
    }
    onChangeSecondary({
      quantity,
      unit:
        secondaryUnit ??
        data?.category.secondaryQuantityUnit ??
        QuantityUnitEnum.Amount,
    });
  };

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <View style={{ zIndex: 10 }}>
      <View style={{ gap: 4, flex: 1 }}>
        <Label size="medium">Mängd och enhet</Label>
        <Body size="medium">
          Välj den enhet som bäst beskriver hur produkten säljs.
        </Body>
      </View>
      <View
        style={{ flexDirection: "row", gap: 16, zIndex: 10, marginTop: 16 }}
      >
        <View style={{ minWidth: 213 }}>
          <TextInput
            placeholder={primaryQuantity}
            value={primaryQuantity !== "0" ? primaryQuantity : undefined}
            onChange={(t) => onChangePrimaryQuantity(t)}
            inputType="numeric"
            error={!!primaryError}
          />
          {primaryError && (
            <Body size="small" color="error" style={{ marginTop: 12 }}>
              {primaryError}
            </Body>
          )}
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
            onSelect={(value) =>
              onChangeUnit(value as QuantityUnitEnum, "primary")
            }
          />
        </View>
      </View>
      {!!data.category.secondaryQuantityUnit && (
        <View style={{ marginTop: 24 }}>
          <View style={{ gap: 4, flex: 1 }}>
            <Label size="medium">Ytterligare enhet</Label>
          </View>
          <View
            style={{ flexDirection: "row", marginTop: 16, gap: 16, zIndex: 9 }}
          >
            <View style={{ minWidth: 213 }}>
              <TextInput
                placeholder={secondaryQuantity}
                value={
                  secondaryQuantity !== "0" ? secondaryQuantity : undefined
                }
                onChange={onChangeSecondaryQuantity}
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
                onSelect={(value) =>
                  onChangeUnit(value as QuantityUnitEnum, "secondary")
                }
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
