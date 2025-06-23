import {
  BrandSectionQuery,
  BrandSectionQueryVariables,
  BrandTypeEnum,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { SearchInput } from "@components/forms/searchInput";
import { Body, Display, Headline } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";

const BRAND_SECTION_QUERY = gql`
  query BrandSection($input: CategoryInput!) {
    brands {
      id
      name
      type
    }
    category(input: $input) {
      id
      brands {
        id
        name
      }
    }
  }
`;

type Props = {
  categoryId: string;
  brandId?: string | null;
  onSelect: (brandId: string | null) => void;
};

export const BrandSection = ({ categoryId, brandId, onSelect }: Props) => {
  const [searchString, setSearchString] = useState("");
  const colors = useThemeColor();

  const { data } = useQuery<BrandSectionQuery, BrandSectionQueryVariables>(
    BRAND_SECTION_QUERY,
    {
      variables: { input: { id: categoryId } },
    },
  );

  const otherBrands = data?.brands.filter(
    (brand) => brand.type === BrandTypeEnum.Other,
  );

  const searchedBrands = data?.brands.filter(
    (brand) =>
      brand.name.toLowerCase().startsWith(searchString.toLowerCase()) &&
      brand.type !== BrandTypeEnum.Other,
  );

  const renderBrandRow = (name: string, id: string) => {
    return (
      <View
        key={id}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Body size="medium">{name}</Body>
        <Button
          label="Välj"
          onPress={() => {
            setSearchString("");
            onSelect(id);
          }}
        />
      </View>
    );
  };

  if (brandId) {
    const selectedBrand = data?.brands.find((brand) => brand.id === brandId);

    return (
      <View style={{ gap: 12 }}>
        <Headline size="small">Välj ett varumärke</Headline>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Body size="medium">{selectedBrand?.name}</Body>
          <Button label="Ändra" onPress={() => onSelect(null)} type="tonal" />
        </View>
      </View>
    );
  }

  return (
    <View>
      <Display size="small" style={{ marginBottom: 24 }}>
        Välj ett varumärke
      </Display>
      <SearchInput
        value={searchString}
        onChange={(t) => setSearchString(t)}
        placeholder="Hitta varumärke"
      />
      <View style={{ gap: 16, marginTop: 16 }}>
        {!searchString ? (
          <>
            {otherBrands?.map((brand) => renderBrandRow(brand.name, brand.id))}
            <View
              style={{
                borderBottomWidth: 1,
                borderColor: colors.dividers.neutral,
              }}
            />
            {data?.category.brands.map((brand) =>
              renderBrandRow(brand.name, brand.id),
            )}
          </>
        ) : searchedBrands?.length ? (
          searchedBrands.map((brand) => renderBrandRow(brand.name, brand.id))
        ) : (
          <View>
            <View style={{ gap: 2, marginBottom: 48 }}>
              <Headline size="small">0 träffar</Headline>
              <Body size="medium" color="secondary">
                Ojdå, vi kunde inte hitta några varumärken som matchar '
                {searchString}'
              </Body>
            </View>

            <View style={{ gap: 2, marginBottom: 24 }}>
              <Headline size="small">Saknar varumärket? Välj "Okänt"</Headline>
              <Body size="medium" color="secondary">
                Om varumärket du söker inte finns i listan så väljer du "Okänt".
                Vi jobbar löpande med att uppdatera listan med nya varumärken.
              </Body>
            </View>
            <View style={{ gap: 8 }}>
              <Button
                label={`Ja, använd "Okänt"`}
                onPress={() => {
                  setSearchString("");
                  onSelect(
                    data?.brands.find(
                      (brand) => brand.type === BrandTypeEnum.Other,
                    )?.id ?? null,
                  );
                }}
              />
              <Button
                label="Visa alla varumärken igen"
                type="tonal"
                onPress={() => setSearchString("")}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
