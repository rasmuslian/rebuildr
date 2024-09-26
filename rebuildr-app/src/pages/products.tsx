import { useQuery } from "@apollo/client";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect } from "react";
import { Pressable, View, StyleSheet, Image } from "react-native";
import { Body, Title } from "src/components/texts/text";
import { gql } from "src/gql";
import { Button } from "src/components/button";
import Colors from "src/styles/colors";
import { Picker } from "@react-native-picker/picker";
import { conditionTranslationMap } from "src/constants/constants";
import { ProductConditionEnum } from "src/gql/graphql";
import { Page } from "src/components/layout/page";
import * as L from "leaflet";
import "./map.css";
import { ProductCard } from "src/components/productCard";

const PRODUCTS_QUERY = gql(`
  query ProductsQuery($input: ProductsInput!) {
    products(input: $input) {
      products {
        id
        title
        address
        distanceFromPosition
        price
        isGiveaway
        likedByUser
        mainImage {
          presignedGetUrl
        }
        location {
          latitude
          longitude
        }
        user {
          id
          username
        }
      }
      origin {
        latitude
        longitude
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

  const searchString = route.params?.searchString;
  const address = route.params?.address;
  const _distance = parseInt(route.params?.distance);
  const distance = isNaN(_distance) ? undefined : _distance;
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
        limit: 2,
        offset: 0,
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

  const onSetFilter = (input: {
    searchString?: string;
    address?: string;
    distance?: number;
    categoryId?: string;
    selectionCategories?: boolean;
    seasonalCategories?: boolean;
    giveaway?: boolean;
    condition?: ProductConditionEnum;
  }) => {
    if (loading) {
      return;
    }
    //returns the current params and upserts params from argument 'input'
    const newFilterParams = Object.keys(input).reduce(
      (filterParams, inputParam) => {
        return {
          ...filterParams,
          [inputParam]: input[inputParam],
        };
      },
      { ...route.params },
    );

    navigation.setParams(newFilterParams);
  };

  useEffect(() => {
    if (!data) {
      return;
    }

    const defaultCenter = { lat: 59.861365680637014, lng: 17.6392102780016 };
    const center = data.products.origin
      ? {
          lat: data.products.origin.latitude,
          lng: data.products.origin.longitude,
        }
      : defaultCenter;

    const map = L.map("map").setView(center, 14);

    //Stadia_OSMBright
    L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.{ext}",
      {
        minZoom: 0,
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: "png",
      },
    ).addTo(map);

    const myIcon = L.icon({
      iconUrl: "../../assets/images/my-position.png",
      iconAnchor: [5, 60],
    });

    if (data.products.origin) {
      L.marker(center, {
        icon: myIcon,
      }).addTo(map);
    }

    data.products.products.forEach((product) => {
      const icon = L.divIcon({
        html: `<div><p>${product.price}</p></div><div class="triangle"/>`,
        iconSize: [30, 30],
        iconAnchor: [5, 60],
        className: "test",
      });
      return L.marker([product.location.latitude, product.location.longitude], {
        icon: icon,
      }).addTo(map);
    });

    return () => {
      map.remove();
    };
  }, [data]);

  return (
    <Page>
      <View style={styles.container}>
        <View style={styles.searchParams}>
          <View style={styles.searchFields}>
            <Title>Din sökning:</Title>
            {!!searchString && (
              <Button
                title={searchString}
                onPress={() => onSetFilter({ searchString: undefined })}
              />
            )}
            {categoryData && (
              <Button
                title={categoryData.category.name}
                onPress={() => onSetFilter({ categoryId: undefined })}
              />
            )}
            {!!address && !distance && (
              <Button
                title={address}
                onPress={() => onSetFilter({ address: undefined })}
              />
            )}
            {!!address && !!distance && (
              <Button
                title={`<${distance}km från ${address}`}
                onPress={() =>
                  onSetFilter({ address: undefined, distance: undefined })
                }
              />
            )}
            {selectionCategories && (
              <Button
                title="Utvalda kategorier"
                onPress={() => onSetFilter({ selectionCategories: undefined })}
              />
            )}
            {seasonalCategories && (
              <Button
                title="Säsongskategorier"
                onPress={() => onSetFilter({ seasonalCategories: undefined })}
              />
            )}
            {giveaway && (
              <Button
                title="Bortskänkes"
                onPress={() => onSetFilter({ giveaway: undefined })}
              />
            )}
            {condition && (
              <Button
                title={conditionTranslationMap[condition]}
                onPress={() => onSetFilter({ condition: undefined })}
              />
            )}
          </View>
          <Body>
            {data?.products.products.length} stycken träffar i din sökning
          </Body>
        </View>
        <View style={styles.filterContainer}>
          <Picker
            selectedValue={condition ?? "unselected"}
            onValueChange={(v: ProductConditionEnum | "unselected") => {
              if (v === "unselected") {
                onSetFilter({ condition: undefined });
                return;
              }
              onSetFilter({ condition: v });
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
        <div id="map" />
        <View style={styles.productsContainer}>
          {data?.products.products.map((p) => (
            <ProductCard
              {...p}
              distance={p.distanceFromPosition}
              liked={p.likedByUser}
            />
          ))}
        </View>
      </View>
    </Page>
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
