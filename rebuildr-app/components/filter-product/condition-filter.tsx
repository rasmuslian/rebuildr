import { ProductConditionEnum } from "@/gql/graphql";
import { FilterSection } from "./filter-section";
import { View } from "react-native";
import { Body, Label } from "@components/typography/text";
import { conditions } from "@constants/conditions";
import { Pressable } from "react-native-gesture-handler";
import { Check } from "@components/controls/check";
import { useFilterProduct } from "@hooks/useFilterProduct";

export const ConditionFilter = () => {
  const { filter, toggleValue } = useFilterProduct();
  const values = () => {
    return Object.values(ProductConditionEnum).map(
      (c) => c,
    ) as ProductConditionEnum[];
  };
  return (
    <FilterSection
      title="Skick"
      initialOpen
      collapsedText={
        filter.conditions?.length
          ? `${conditions[filter.conditions[0]].name}` +
            `${filter.conditions[1] ? ", " + conditions[filter.conditions[1]].name : ""}` +
            `${filter.conditions.length > 2 ? " +" + (filter.conditions.length - 2) + " till" : ""}`
          : "Alla skick"
      }
    >
      <View style={{ gap: 16 }}>
        {values().map((condition, i) => (
          <Pressable
            key={i}
            onPress={() => toggleValue(condition, "conditions")}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 24,
              }}
            >
              <View style={{ gap: 4, flex: 1 }}>
                <Label size="medium">{conditions[condition].name}</Label>
                <Body size="medium">{conditions[condition].description}</Body>
              </View>
              <Check
                selected={
                  filter.conditions
                    ? filter.conditions.some((c) => c === condition)
                    : true
                }
              />
            </View>
          </Pressable>
        ))}
      </View>
    </FilterSection>
  );
};
