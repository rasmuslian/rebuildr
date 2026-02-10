import {
  BrandSectionQuery,
  BrandSectionQueryVariables,
  BrandSectionSearchBrandQuery,
  BrandSectionSearchBrandQueryVariables,
  BrandTypeEnum,
  CreateBrandByUserMutation,
  CreateBrandByUserMutationVariables,
} from "@/gql/graphql";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { SearchInput } from "@components/forms/searchInput";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Body, Display, Headline } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { View } from "react-native";
import { useDebounceCallback } from "usehooks-ts";

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

const BRAND_SECTION_SEARCH_BRAND = gql`
  query BrandSectionSearchBrand($input: BrandsInput!) {
    brands(input: $input) {
      id
      name
      type
    }
  }
`;

const CREATE_BRAND_BY_USER = gql`
  mutation CreateBrandByUser($input: CreateBrandByUserInput!) {
    createBrandByUser(input: $input) {
      id
      name
      type
    }
  }
`;

type Props = {
  categoryId: string;
  brandId?: string | null;
  isLoading?: boolean;
  onSelect: (brandId: string | null) => void;
};

export const BrandSection = ({
  categoryId,
  brandId,
  isLoading,
  onSelect,
}: Props) => {
  const [searchString, setSearchString] = useState("");
  const colors = useThemeColor();

  const { data } = useQuery<BrandSectionQuery, BrandSectionQueryVariables>(
    BRAND_SECTION_QUERY,
    {
      variables: { input: { id: categoryId } },
    },
  );

  const [createBrandByUser, { loading: isCreatingBrand, error: createError }] =
    useMutation<CreateBrandByUserMutation, CreateBrandByUserMutationVariables>(
      CREATE_BRAND_BY_USER,
      {
        refetchQueries: ["BrandSection"],
      },
    );

  const [
    searchBrands,
    { data: searchBrandsData, loading: searchBrandsLoading },
  ] = useLazyQuery<
    BrandSectionSearchBrandQuery,
    BrandSectionSearchBrandQueryVariables
  >(BRAND_SECTION_SEARCH_BRAND);

  const debouncedSearchBrands = useDebounceCallback(searchBrands, 500);

  const onChangeSearchString = (searchString: string) => {
    debouncedSearchBrands({ variables: { input: { name: searchString } } });
    setSearchString(searchString);
  };
  const otherBrands = data?.brands.filter(
    (brand) => brand.type === BrandTypeEnum.Other,
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

  const handleCreateBrand = async () => {
    if (!searchString.trim()) return;
    const response = await createBrandByUser({
      variables: {
        input: {
          name: searchString.trim(),
          categoryId,
        },
      },
    });
    const createdBrand = response.data?.createBrandByUser;

    if (createdBrand) {
      setSearchString("");
      onSelect(createdBrand.id);
    }
  };

  if (brandId) {
    const selectedBrand = data?.brands.find((brand) => brand.id === brandId);

    return (
      <View style={{ gap: 12 }}>
        <Headline size="small">Välj ett varumärke</Headline>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
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
        )}
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
        onChange={onChangeSearchString}
        placeholder="Hitta varumärke"
      />
      <View style={{ gap: 16, marginTop: 16 }}>
        {isLoading || searchBrandsLoading ? (
          <LoadingSpinner />
        ) : !searchString ? (
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
        ) : searchBrandsData?.brands.length ? (
          searchBrandsData.brands.map((brand) =>
            renderBrandRow(brand.name, brand.id),
          )
        ) : (
          <View>
            <View style={{ gap: 2, marginBottom: 48 }}>
              <Headline size="small">0 träffar</Headline>
              <Body size="medium" color="secondary">
                Ojdå, vi kunde inte hitta några varumärken som matchar '
                {searchString}'
              </Body>
            </View>

            <View style={{ gap: 4, marginBottom: 24 }}>
              <Headline size="small" style={{ marginBottom: 6 }}>
                Lägg till nytt varumärke:
              </Headline>
              <Display size="small">{searchString}</Display>
              <Body size="medium" color="secondary">
                Om varumärket saknas kan du lägga till det manuellt. Använd
                officiellt namn och korrekt stavning.
              </Body>
            </View>
            <View style={{ gap: 8 }}>
              <Button
                label="Ja, lägg till varumärke"
                onPress={handleCreateBrand}
                loading={isCreatingBrand}
              />
              <Button
                label="Avbryt och gå tillbaka"
                type="tonal"
                onPress={() => setSearchString("")}
                disabled={isCreatingBrand}
              />
              {createError && (
                <Body size="small" color="error">
                  Kunde inte lägga till varumärket.
                </Body>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
