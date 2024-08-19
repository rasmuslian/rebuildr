import { useQuery } from "@apollo/client";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback } from "react";
import { Pressable, View, StyleSheet, Image, ScrollView } from "react-native";
import { Body, Title } from "src/components/texts/text";
import { gql } from "src/gql";
import { Button } from "src/components/button";
import Colors from "src/styles/colors";
import { Picker } from "@react-native-picker/picker";
import { conditionTranslationMap } from "src/constants/constants";
import { ProductConditionEnum } from "src/gql/graphql";

const PRODUCTS_QUERY = gql(`
  query ProductsQuery($input: ProductsInput!) {
    products(input: $input) {
      id
      title
      address
      price
      mainImage {
        presignedGetUrl
      }
    }
  }
`);

const PRODUCTS_CATEGORY_QUERY = gql(`
  query ProductsCategory($input: CategoryInput!) {
    category(input: $input) {
      id
      name
    }
  }
  `);

export const Products = ({ route }) => {
  const navigation = useNavigation();

  const searchString = route.params?.searchString ?? "";
  const address = route.params?.address ?? "";
  const _distance = parseInt(route.params?.distance);
  const distance = isNaN(_distance) ? 0 : _distance;
  const categoryId = route.params?.categoryId;
  const selectionCategories = route.params?.selectionCategories;
  const seasonalCategories = route.params?.seasonalCategories;
  const giveaway = route.params?.giveaway;
  const condition: ProductConditionEnum = route.params?.condition;

  const { data, loading, refetch } = useQuery(PRODUCTS_QUERY, {
    variables: {
      input: {
        searchString: searchString,
        address: address,
        distance: distance,
        categoryId: categoryId,
        selectionCategories: selectionCategories,
        seasonalCategories: seasonalCategories,
        giveaway: giveaway,
        condition: condition,
      },
    },
  });
  const { data: categoryData, refetch: refetchCategories } = useQuery(
    PRODUCTS_CATEGORY_QUERY,
    {
      variables: {
        input: {
          id: categoryId,
        },
      },
      skip: !categoryId,
    },
  );

  //This hook refetches products and categories when this screen comes into focus.
  //Problem was when navigating here after affecting the products, this page
  //will show an unchanged list of products since this page was never unmounted.
  useFocusEffect(
    useCallback(() => {
      if (refetch) {
        refetch();
      }
      if (categoryId && refetchCategories) {
        refetchCategories();
      }
    }, [categoryId, refetch, refetchCategories]),
  );

  const onRemoveFilter = (input: {
    removeSearchString?: boolean;
    removeAddress?: boolean;
    removeDistance?: boolean;
    removeCategory?: boolean;
    removeSelectionCategories?: boolean;
    removeSeasonalCategories?: boolean;
    removeGiveaway?: boolean;
    removeCondition?: boolean;
  }) => {
    if (loading) {
      return;
    }

    //Setting params will trigger a rerender which in turn will fetch products again
    navigation.setParams({
      searchString: input.removeSearchString ? undefined : searchString,
      address: input.removeAddress ? undefined : address,
      distance: input.removeDistance ? undefined : distance,
      categoryId: input.removeCategory ? undefined : categoryId,
      selectionCategories: input.removeSelectionCategories
        ? undefined
        : selectionCategories,
      seasonalCategories: input.removeSeasonalCategories
        ? undefined
        : seasonalCategories,
      giveaway: input.removeGiveaway ? undefined : giveaway,
      condition: input.removeCondition ? undefined : condition,
    });
  };

  const onAddFilter = (input: { condition: ProductConditionEnum }) => {
    if (loading) {
      return;
    }

    //Setting params will trigger a rerender which in turn will fetch products again
    navigation.setParams({
      searchString: searchString,
      address: address,
      distance: distance,
      categoryId: categoryId,
      selectionCategories: selectionCategories,
      seasonalCategories: seasonalCategories,
      giveaway: giveaway,
      condition: input.condition,
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.searchParams}>
        <View style={styles.searchFields}>
          <Title>Din sökning:</Title>
          {!!searchString && (
            <Button
              title={searchString}
              onPress={() => onRemoveFilter({ removeSearchString: true })}
            />
          )}
          {categoryData && (
            <Button
              title={categoryData.category.name}
              onPress={() => onRemoveFilter({ removeCategory: true })}
            />
          )}
          {!!address && !distance && (
            <Button
              title={address}
              onPress={() => onRemoveFilter({ removeAddress: true })}
            />
          )}
          {!!address && !!distance && (
            <Button
              title={`<${distance}km från ${address}`}
              onPress={() =>
                onRemoveFilter({ removeAddress: true, removeDistance: true })
              }
            />
          )}
          {selectionCategories && (
            <Button
              title="Utvalda kategorier"
              onPress={() =>
                onRemoveFilter({ removeSelectionCategories: true })
              }
            />
          )}
          {seasonalCategories && (
            <Button
              title="Säsongskategorier"
              onPress={() => onRemoveFilter({ removeSeasonalCategories: true })}
            />
          )}
          {giveaway && (
            <Button
              title="Bortskänkes"
              onPress={() => onRemoveFilter({ removeGiveaway: true })}
            />
          )}
          {condition && (
            <Button
              title={conditionTranslationMap[condition]}
              onPress={() => onRemoveFilter({ removeCondition: true })}
            />
          )}
        </View>
        <Body>{data?.products.length} stycken träffar i din sökning</Body>
      </View>
      <View style={styles.filterContainer}>
        <Picker
          selectedValue={condition ?? "unselected"}
          onValueChange={(v: ProductConditionEnum | "unselected") => {
            if (v === "unselected") {
              onRemoveFilter({ removeCondition: true });
              return;
            }
            onAddFilter({ condition: v });
          }}
        >
          <Picker.Item
            key={"condition"}
            value={"unselected"}
            label={"Välj skick"}
          />
          {Object.entries(conditionTranslationMap).map((c, i) => (
            <Picker.Item key={i} value={c[0]} label={c[1]} />
          ))}
        </Picker>
      </View>
      <View style={styles.productsContainer}>
        {data?.products.map((p) => (
          <Pressable
            key={p.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("ProductDetails", { productId: p.id })
            }
          >
            {p.mainImage ? (
              <Image
                alt="Huvudbild av produkten"
                resizeMode="cover"
                style={styles.image}
                defaultSource={{ uri: "../../assets/images/logo.png" }}
                source={{ uri: p.mainImage.presignedGetUrl }}
              />
            ) : (
              <View style={[styles.noImage, styles.image]}>
                <Body>Bild saknas</Body>
              </View>
            )}
            <Title>{p.title}</Title>
            <Body>{p.price} kr</Body>
            <Body>Address: {p.address}</Body>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 76,
  },
  searchParams: {
    flexDirection: "row",
    paddingVertical: 12,
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 2,
    borderColor: Colors.borderGray,
    borderStyle: "solid",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchFields: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  filterContainer: {
    marginBottom: 20,
    flexDirection: "row",
  },
  productsContainer: {
    display: "flex",
    flexDirection: "row",
    width: 620, //Roughly size of two products
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 12,
  },
  card: {
    width: 300, //size of one product,
    padding: 4,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    borderStyle: "solid",
  },
  image: {
    width: "100%",
    height: 80,
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.inactiveGray,
  },
});
