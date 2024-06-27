import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { gql } from "src/gql";
import { Button } from "src/components/button";
import { Input } from "src/components/inputs/input";
import { Page } from "src/components/page";
import { Picker } from "@react-native-picker/picker";
import { NumberInput } from "src/components/inputs/numberInput";
import { Body } from "src/components/texts/text";
import * as Location from "expo-location";

const SELL_QUERY = gql(`
  query SellQuery {
    categories {
      id
      name
      parentId
    }
    me {
      email
      address
    }
  }
`);

const CREATE_PRODUCT = gql(`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      title
      price
      category {
        name
      }
    }
  }
`);

const LOCATION_TO_ADDRESS_QUERY = gql(`
  query LocationToAddress($input: GetAddressInput!) {
    locationToAddress(input: $input) {
      address
    }
  }
  `);

interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export const Sell = () => {
  const [title, setTitle] = useState("");
  const [selectedRootCategory, setSelectedRootCategory] = useState<
    Category & { children: Category[] }
  >();
  const [selectedChildCategory, setSelectedChildCategory] =
    useState<Category>();
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [getAddressLoading, setGetAddressLoading] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<{
    title: string;
    category: { name: string };
    price: number;
  }>();
  const [status, requestPermission] = Location.useForegroundPermissions();

  const { data, loading } = useQuery(SELL_QUERY, {
    onCompleted: (data) => setAddress(data.me.address ?? ""),
  });
  const [getAddress, { error: locationToAddressError }] = useLazyQuery(
    LOCATION_TO_ADDRESS_QUERY,
  );

  const [createProduct, { loading: creatingProduct }] =
    useMutation(CREATE_PRODUCT);

  const categories: (Category & { children: Category[] })[] = useMemo(() => {
    if (!data) {
      return [];
    }
    const rootCategories = data.categories.reduce(
      (
        _rootCategories: {
          id: string;
          name: string;
          parentId?: string;
        }[],
        cat,
      ) => {
        if (!cat.parentId) {
          return [..._rootCategories, cat];
        }
        return _rootCategories;
      },
      [],
    );

    return rootCategories.map((root) => {
      const children = data.categories.reduce(
        (
          _children: {
            id: string;
            name: string;
            parentId?: string;
          }[],
          cat,
        ) => {
          if (cat.parentId === root.id) {
            return [..._children, cat];
          }
          return _children;
        },
        [],
      );
      return {
        ...root,
        children: children,
      };
    });
  }, [data]);

  const onGetMyLocation = async () => {
    if (getAddressLoading) {
      return;
    }
    setGetAddressLoading(true);
    //Cant use this function unless permission is granted. Request it again
    if (!status.granted) {
      await requestPermission();
    }

    const position = await Location.getCurrentPositionAsync();

    getAddress({
      variables: {
        input: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      },
      onCompleted: (data) => {
        setAddress(data.locationToAddress.address);
        setGetAddressLoading(false);
      },
      onError: () => {
        setAddress(address);
        setGetAddressLoading(false);
      },
    });
  };

  const onPublish = () => {
    if (creatingProduct) {
      return;
    }

    const category = selectedChildCategory;
    const productAddress = address || data?.me.address;

    if (!category || !title || price === undefined || !productAddress) {
      //Invalid inputs!
      return;
    }

    const toInt = parseInt(price);
    if (isNaN(toInt)) {
      //invalid number
      return;
    }

    createProduct({
      variables: {
        input: {
          title: title,
          categoryId: category.id,
          price: toInt,
          address: productAddress,
        },
      },
      onCompleted: (data) => {
        setCreatedProduct(data.createProduct);

        //reset
        setTitle("");
        setSelectedChildCategory(undefined);
        setSelectedRootCategory(undefined);
        setPrice(undefined);
        setAddress("");
      },
    });
  };

  if (createdProduct) {
    return (
      <Page title={"Vara skapad!"}>
        <Body>title: {createdProduct.title}</Body>
        <Body>category: {createdProduct.category.name}</Body>
        <Body>price: {createdProduct.price} kr</Body>
        <Button
          title="Skapa en till"
          onPress={() => setCreatedProduct(undefined)}
        />
      </Page>
    );
  }

  return (
    <Page title={"Vad vill du sälja?"} loading={loading}>
      <View style={styles.formContainer}>
        <Picker
          selectedValue={selectedRootCategory?.id}
          onValueChange={(v) => {
            const selectedCategory = categories.find((cat) => cat.id === v);
            setSelectedRootCategory(selectedCategory);
          }}
        >
          <Picker.Item
            key={"kategori"}
            label={"Välj en kategori"}
            value={"unselected"}
          />
          {categories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedChildCategory?.id}
          onValueChange={(v) => {
            const selectedCategory = selectedRootCategory.children.find(
              (cat) => cat.id === v,
            );
            setSelectedChildCategory(selectedCategory);
          }}
          enabled={!!selectedRootCategory}
        >
          <Picker.Item
            key={"underkategori"}
            label={"Välj en underkategori"}
            value={"unselected"}
          />
          {selectedRootCategory?.children.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>
        <Input
          onChange={setTitle}
          placeholder={"Titel på objektet"}
          value={title}
        />
        <NumberInput
          onChange={setPrice}
          value={price}
          placeholder={"Ange pris"}
        />
        <View style={styles.locationInputContainer}>
          <View style={styles.inputAndButtonContainer}>
            <Input
              value={address}
              onChange={setAddress}
              placeholder={"Ange var varan finns"}
              disabled={getAddressLoading}
            />
            <Button
              icon="Pin"
              onPress={onGetMyLocation}
              loading={getAddressLoading}
            />
          </View>
          {locationToAddressError && (
            <Body size="small">Ett fel uppstod vid hämtning av address</Body>
          )}
        </View>

        <Button
          title="Publicera"
          onPress={onPublish}
          disabled={creatingProduct}
        />
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    borderColor: "#000",
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    padding: 20,
  },
  locationInputContainer: {
    gap: 4,
  },
  inputAndButtonContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
