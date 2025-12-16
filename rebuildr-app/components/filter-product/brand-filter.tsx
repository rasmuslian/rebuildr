import { SearchInput } from "@components/forms/searchInput";
import { FilterSection } from "./filter-section";
import { Fragment, useState } from "react";
import { View } from "react-native";
import { Body } from "@components/typography/text";
import { Check } from "@components/controls/check";
import { Divider } from "@components/dividers/divider";
import { gql, useQuery } from "@apollo/client";
import { Brand, BrandFilterQuery, BrandTypeEnum } from "@/gql/graphql";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Pressable } from "react-native-gesture-handler";
import { useFilterProduct } from "@hooks/useFilterProduct";

const BRAND_FILTER = gql`
  query BrandFilter {
    brands {
      id
      name
      type
    }
  }
`;

type BrandByLetter = {
  [key: string]: Pick<Brand, "id" | "name">[];
};

export const BrandFilter = () => {
  const [searchString, setSearchString] = useState("");
  const { filter, filterBuilder } = useFilterProduct();

  const { data } = useQuery<BrandFilterQuery>(BRAND_FILTER);

  if (!data) {
    return <LoadingSpinner />;
  }

  const regularBrands = data.brands.filter(
    (brand) => brand.type === BrandTypeEnum.Regular,
  );
  const otherBrands = data.brands.filter(
    (brand) => brand.type === BrandTypeEnum.Other,
  );

  const brandsSortedByLetter = regularBrands.reduce(
    (acc: BrandByLetter, curr) => {
      const firstLetter = curr.name.charAt(0);
      const upperCase = firstLetter.toUpperCase();
      if (acc[upperCase]) {
        return { ...acc, [upperCase]: [...acc[upperCase], curr] };
      }

      //Order acc by letter alphabetically
      const unorderedAcc = { ...acc, [upperCase]: [curr] };
      const keysAlphabetically = Object.keys(unorderedAcc).sort((a, b) =>
        a > b ? 1 : -1,
      );
      const orderedAcc = keysAlphabetically.reduce(
        (acc: BrandByLetter, curr) => {
          return { ...acc, [curr]: unorderedAcc[curr] };
        },
        {},
      );

      return orderedAcc;
    },
    {},
  );

  return (
    <FilterSection
      title="Varumärke"
      initialOpen={!!filter.brandIds}
      collapsedText={
        filter.brandIds?.length
          ? `${data.brands.find((brand) => filter.brandIds?.[0] === brand.id)?.name}` +
            `${filter.brandIds?.[1] ? ", " + data.brands.find((brand) => filter.brandIds?.[1] === brand.id)?.name : ""}` +
            `${filter.brandIds?.length > 2 ? " +" + (filter.brandIds.length - 2) + " till" : ""}`
          : "Alla varumärken"
      }
    >
      <View style={{ gap: 16 }}>
        <SearchInput
          value={searchString}
          onChange={(t) => setSearchString(t)}
          placeholder="Hitta varumärke"
        />
        {!searchString &&
          otherBrands.map((brand) => (
            <Pressable
              key={brand.id}
              onPress={() =>
                filterBuilder.toggleValue(brand.id, "brandIds").apply()
              }
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginVertical: 8,
                }}
              >
                <Body size="medium">Okänt varumärke</Body>
                <Check
                  selected={
                    filter.brandIds
                      ? filter.brandIds.some((id) => id === brand.id)
                      : true
                  }
                />
              </View>
            </Pressable>
          ))}
        {Object.keys(brandsSortedByLetter)
          .filter((letter) =>
            searchString ? searchString.toUpperCase().startsWith(letter) : true,
          )
          .map((letter, i) => (
            <Fragment key={letter}>
              <Divider />
              <FilterSection
                title={letter}
                key={letter}
                initialOpen={brandsSortedByLetter[letter].some((brand) =>
                  filter.brandIds?.some((id) => brand.id === id),
                )}
              >
                {brandsSortedByLetter[letter]
                  .filter((brand) =>
                    searchString
                      ? brand.name
                          .toLowerCase()
                          .includes(searchString.toLowerCase())
                      : true,
                  )
                  .map((brand) => (
                    <Pressable
                      key={brand.id}
                      onPress={() =>
                        filterBuilder.toggleValue(brand.id, "brandIds").apply()
                      }
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginVertical: 8,
                        }}
                      >
                        <Body size="medium">{brand.name}</Body>
                        <Check
                          selected={
                            filter.brandIds
                              ? filter.brandIds.some((id) => id === brand.id)
                              : true
                          }
                        />
                      </View>
                    </Pressable>
                  ))}
              </FilterSection>
            </Fragment>
          ))}
      </View>
    </FilterSection>
  );
};
