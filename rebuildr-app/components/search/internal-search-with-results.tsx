import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { InternalAdsSearchQuery } from "@/gql/graphql";
import PlaceholderProduct from "@assets/images/placeholder-product.png";
import { Button } from "@components/buttons/button";
import { dividerStyles } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Body, Label, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useSearchContext } from "@context/search-context";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";

type Props = {
  data: InternalAdsSearchQuery | undefined;
  searchString?: string;
  searchCompleted?: boolean;
};

export const InternalSearchWithResults = ({
  data,
  searchString,
  searchCompleted = false,
}: Props) => {
  const searchContext = useSearchContext();
  const colors = useThemeColor();
  const normalizedSearchString = searchString?.trim().toLocaleLowerCase() ?? "";
  const products = data?.internalAds.products ?? [];
  const categories = products
    .map((product) => product.category)
    .filter(Boolean)
    .filter(
      (category, index, allCategories) =>
        allCategories.findIndex((item) => item?.id === category?.id) === index,
    )
    .filter((category) =>
      category?.name.toLocaleLowerCase().includes(normalizedSearchString),
    );
  const suggestions = [
    ...new Set(
      [
        ...products.map((product) => product.title),
        ...categories.map((category) => category?.name),
      ].filter((suggestion): suggestion is string => !!suggestion),
    ),
  ].slice(0, 8);
  const hasAnyResult = !!products.length || !!categories.length;
  const showSuggestions =
    !!suggestions.length || (searchCompleted && !hasAnyResult);
  const visibleSections = [
    showSuggestions,
    !!products.length,
    !!categories.length,
  ];

  const hasSectionAfter = (index: number) =>
    visibleSections.slice(index + 1).some(Boolean);

  const sectionStyle = (index: number, paddingBottom = 16) => [
    { gap: 12, paddingBottom },
    hasSectionAfter(index) && dividerStyles(colors).bottomDivider,
  ];

  const openSearchTerm = (searchTerm: string) => {
    searchContext.setSearchState({
      dropdownVisible: false,
      searchString: searchTerm,
      searchScope: "internal",
    });
    router.navigate({
      pathname: "/internal/search",
      params: { q: searchTerm },
    });
  };

  if (!searchCompleted) {
    return <LoadingSpinner style={{ minHeight: 96 }} />;
  }

  return (
    <>
      {showSuggestions && (
        <View style={sectionStyle(0, suggestions.length ? 16 : 12)}>
          <Title size="medium">Sökförslag</Title>
          {suggestions.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8, paddingRight: 16 }}>
                {suggestions.map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    onPress={() => openSearchTerm(suggestion)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: borderRadius.medium,
                        backgroundColor: colors.background.secondary,
                      }}
                    >
                      <Icon icon="search" size={16} />
                      <Label size="large">{suggestion}</Label>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          ) : (
            <Body size="medium">
              Ojdå, vi kunde inte hitta några interna sökförslag som matchar '
              {searchString}'.
            </Body>
          )}
        </View>
      )}

      {!!products.length && (
        <View style={sectionStyle(1)}>
          <Title size="medium">Interna annonser</Title>
          <View style={{ gap: 12 }}>
            {products.map((product) => (
              <Pressable
                key={product.id}
                onPress={() => {
                  searchContext.setSearchState({ dropdownVisible: false });
                  router.navigate({
                    pathname: "/internal/[productId]",
                    params: { productId: product.id },
                  });
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Image
                    source={product.primaryImage?.url ?? PlaceholderProduct.uri}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: borderRadius.small,
                      backgroundColor: colors.background.secondary,
                    }}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Label size="large" numberOfLines={1}>
                      {product.title}
                    </Label>
                    <Body size="small" color="secondary">
                      {product.category?.name ??
                        product.brand?.name ??
                        "Intern annons"}
                    </Body>
                  </View>
                  <Icon icon="chevronRight" size={18} />
                </View>
              </Pressable>
            ))}
          </View>
          <Button
            label="Visa alla resultat"
            type="tonal"
            onPress={() => openSearchTerm(searchString ?? "")}
            style={{
              width: "100%",
              backgroundColor: colors.background.secondary,
            }}
          />
        </View>
      )}

      {!!categories.length && (
        <View style={sectionStyle(2, 0)}>
          <Title size="medium">Kategorier</Title>
          <View style={{ gap: 12 }}>
            {categories.map((category) => (
              <Pressable
                key={category?.id}
                onPress={() => openSearchTerm(category?.name ?? "")}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: borderRadius.small,
                      backgroundColor: colors.background.secondary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon icon="categories" size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Label size="large" numberOfLines={1}>
                      {category?.name}
                    </Label>
                  </View>
                  <Icon icon="chevronRight" size={18} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </>
  );
};
