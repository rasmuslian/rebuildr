import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

import { DoSearchQuery, UserType } from "@/gql/graphql";
import { capitalFirstLetter, formatPrice } from "@/utils/formattings";
import PlaceholderCategory from "@assets/images/category-placeholder.jpeg";
import PlaceholderProduct from "@assets/images/placeholder-product.png";
import { Avatar } from "@components/avatar/avatar";
import { Badge } from "@components/badges/badge";
import { Button } from "@components/buttons/button";
import { dividerStyles } from "@components/dividers/divider";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useSearchContext } from "@context/search-context";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";

type Props = {
  data: DoSearchQuery | undefined;
  searchString?: string;
  size?: "small" | "large";
};

export const SearchWithResults = ({
  data,
  searchString,
  size = "large",
}: Props) => {
  const { filterBuilder } = useFilterProduct();
  const searchContext = useSearchContext();

  const colors = useThemeColor();
  const normalizedSearchString = searchString?.trim().toLocaleLowerCase() ?? "";
  const similarSearchResults = data?.getSimilarSearchResults ?? [];
  const products = data?.products.products ?? [];
  const categoryMatches = (data?.getCategories ?? [])
    .filter((category) =>
      category.name.toLocaleLowerCase().includes(normalizedSearchString),
    )
    .slice(0, 5);
  const exactUsers = (data?.users.users ?? []).filter(
    (user) => user.username?.toLocaleLowerCase() === normalizedSearchString,
  );
  const hasAnyResult =
    !!similarSearchResults.length ||
    !!products.length ||
    !!categoryMatches.length ||
    !!exactUsers.length;
  const showSuggestions = !!similarSearchResults.length || !hasAnyResult;
  const visibleSections = [
    showSuggestions,
    !!products.length,
    !!categoryMatches.length,
    !!exactUsers.length,
  ];

  const hasSectionAfter = (index: number) => {
    return visibleSections.slice(index + 1).some(Boolean);
  };

  const sectionStyle = (index: number, paddingBottom = 16) => [
    { gap: 12, paddingBottom },
    hasSectionAfter(index) && dividerStyles(colors).bottomDivider,
  ];

  const Header = ({ children }: { children: React.ReactNode }) => {
    if (size === "large") {
      return <Headline size="small">{children}</Headline>;
    } else {
      return <Title size="medium">{children}</Title>;
    }
  };

  const openSearchResults = () => {
    filterBuilder
      .reset()
      .setSearchString(searchString ?? "")
      .apply();
    searchContext.setSearchState({ dropdownVisible: false });
    router.navigate("/search/products");
  };

  const openSearchTerm = (searchTerm: string) => {
    filterBuilder.reset().setSearchString(searchTerm).apply();
    searchContext.setSearchState({
      dropdownVisible: false,
      searchString: searchTerm,
    });
    searchContext.search(searchTerm);
    router.navigate("/search/products");
  };

  return (
    <>
      {showSuggestions && (
        <View style={sectionStyle(0, similarSearchResults.length ? 16 : 12)}>
          <Header>Sökförslag</Header>
          {similarSearchResults.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8, paddingRight: 16 }}>
                {similarSearchResults.map((searchResult, i) => (
                  <Pressable
                    key={i}
                    onPress={() => openSearchTerm(searchResult.searchString)}
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
                      <Label size="large">
                        {capitalFirstLetter(searchResult.searchString)}
                      </Label>
                    </View>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          ) : (
            <Body size="medium">
              Ojdå, vi kunde inte hitta några sökförslag som matchar '
              {searchString}'.
            </Body>
          )}
        </View>
      )}

      {!!products.length && (
        <View style={sectionStyle(1)}>
          <Header>Produkter</Header>
          <View style={{ gap: 12 }}>
            {products.map((product, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  searchContext.setSearchState({ dropdownVisible: false });
                  router.navigate({
                    pathname: "/product/[productId]",
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
                    <Body size="small">{formatPrice(product.price)}</Body>
                  </View>
                  <Icon icon="chevronRight" size={18} />
                </View>
              </Pressable>
            ))}
          </View>
          <View style={{ width: "100%" }}>
            <Button
              label="Visa allt"
              type="tonal"
              onPress={openSearchResults}
              style={{
                width: "100%",
                backgroundColor: colors.background.secondary,
              }}
            />
          </View>
        </View>
      )}

      {!!categoryMatches.length && (
        <View style={sectionStyle(2)}>
          <Header>Kategorier</Header>
          <View style={{ gap: 12 }}>
            {categoryMatches.map((category, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  filterBuilder
                    .setCategories([category])
                    .setSearchString("")
                    .apply();

                  searchContext.setSearchState({
                    dropdownVisible: false,
                    searchString: undefined,
                  });

                  router.navigate({
                    pathname: "/search/products/[categoryId]",
                    params: { categoryId: category.id },
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
                    source={category.image?.url ?? PlaceholderCategory.uri}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: borderRadius.small,
                      backgroundColor: colors.background.secondary,
                    }}
                  />
                  <View style={{ flex: 1 }}>
                    <Label size="large" numberOfLines={1}>
                      {category.name}
                    </Label>
                  </View>
                  <Icon icon="chevronRight" size={18} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {!!exactUsers.length && (
        <View style={sectionStyle(3, 0)}>
          <Header>Säljare</Header>
          <View style={{ marginTop: 12, gap: 16 }}>
            {exactUsers.map((user, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  searchContext.setSearchState({ dropdownVisible: false });
                  router.navigate({
                    pathname: "/account/profile",
                    params: { userId: user.id },
                  });
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <Avatar
                    placeholder={user.type}
                    imageUrl={user.profilePicture?.url}
                  />
                  <View style={{ gap: 2, flex: 1 }}>
                    <Label size="large">{user.username}</Label>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 2,
                        alignItems: "center",
                      }}
                    >
                      {user.type === UserType.Business && (
                        <View>
                          <Badge size="medium" text="Företag" />
                        </View>
                      )}

                      <Body size="small">
                        {user.numberOfPublishedProducts} annonser •{" "}
                        {user.numberOfSoldProducts} sålda
                      </Body>
                    </View>
                  </View>
                  <Icon icon="search" size={18} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </>
  );
};
