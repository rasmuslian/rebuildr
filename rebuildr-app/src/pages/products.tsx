import { useQuery } from "@apollo/client";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { Body, Title } from "src/components/texts/text";
import { gql } from "src/gql";
import { Button } from "src/components/button";
import Colors from "src/styles/colors";

const PRODUCTS_QUERY = gql(`
  query ProductsQuery($input: ProductsInput!) {
    products(input: $input) {
      id
      title
      address
      price
    }
  }
`);

export const Products = ({ route }) => {
  const navigation = useNavigation();

  const searchString = route.params?.searchString ?? "";
  const address = route.params?.address ?? "";
  const _distance = parseInt(route.params?.distance);
  const distance = isNaN(_distance) ? 0 : _distance;

  const { data, loading } = useQuery(PRODUCTS_QUERY, {
    variables: {
      input: {
        searchString: searchString,
        address: address,
        distance: distance,
      },
    },
  });

  const onRemoveFilter = (input: {
    removeSearchString?: boolean;
    removeAddress?: boolean;
    removeDistance?: boolean;
  }) => {
    if (loading) {
      return;
    }

    navigation.setParams({
      searchString: input.removeSearchString ? undefined : searchString,
      address: input.removeAddress ? undefined : address,
      distance: input.removeDistance ? undefined : distance,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchParams}>
        <View style={styles.searchFields}>
          <Title>Din sökning:</Title>
          {!!searchString && (
            <Button
              title={searchString}
              onPress={() => onRemoveFilter({ removeSearchString: true })}
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
        </View>
        <Body>{data?.products.length} stycken träffar i din sökning</Body>
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
            <Title>{p.title}</Title>
            <Body>{p.price} kr</Body>
            <Body>Address: {p.address}</Body>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 76,
  },
  searchParams: {
    flexDirection: "row",
    paddingVertical: 12,
    marginVertical: 20,
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
  productsContainer: {
    display: "flex",
    flexDirection: "row",
    width: 420, //Roughly size of two products
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 12,
  },
  card: {
    width: 200, //size of one product,
    padding: 4,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 5,
    borderStyle: "solid",
  },
});
