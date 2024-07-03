import { useMutation, useQuery } from "@apollo/client";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { gql } from "src/gql";
import { Button } from "src/components/button";
import { Input } from "src/components/inputs/input";
import { Page } from "src/components/page";
import { Picker } from "@react-native-picker/picker";
import { NumberInput } from "src/components/inputs/numberInput";
import { Body } from "src/components/texts/text";
import * as ImagePicker from "expo-image-picker";

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
      product {
        title
        price
        category {
          name
        }
      }
      presignedPutUrls
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
  const nrMaxImages = 5;
  const [images, setImages] = useState<{ uri: string; mimeType: string }[]>([]);
  const [createdProduct, setCreatedProduct] = useState<{
    title: string;
    category: { name: string };
    price: number;
  }>();
  const mediaHook = ImagePicker.useMediaLibraryPermissions();

  const { data, loading } = useQuery(SELL_QUERY, {
    onCompleted: (data) => setAddress(data.me.address ?? ""),
  });

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

  const onAddPicture = async () => {
    const nrImagesLeft = nrMaxImages - images.length;
    if (nrImagesLeft === 0) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: nrImagesLeft,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (result.canceled) {
      return;
    }

    const files = result.assets
      .filter((asset) => !!asset.mimeType)
      .map((asset) => ({
        uri: asset.uri,
        mimeType: asset.mimeType,
      }));
    setImages(files);
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
          images: images.map((image) => ({ mimeType: image.mimeType })),
        },
      },
      onCompleted: (data) => {
        setCreatedProduct(data.createProduct.product);

        //send all images
        Promise.all(
          data.createProduct.presignedPutUrls.map(async (url, i) => {
            const image = images[i];
            const file = await fetch(image.uri);
            const blob = await file.blob();
            if (!image) {
              return;
            }
            return fetch(url, {
              method: "PUT",
              body: blob,
              headers: {
                "Content-Type": image.mimeType,
              },
            });
          }),
        )
          .then((v) => {
            //TODO: do something here
            console.log("v :>> ", v);
          })
          //TODO: do something here
          .catch((e) => console.log("e :>> ", e));

        //reset
        setTitle("");
        setSelectedChildCategory(undefined);
        setSelectedRootCategory(undefined);
        setPrice(undefined);
        setAddress("");
        setImages([]);
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
        <Input
          value={address}
          onChange={setAddress}
          placeholder={"Ange var varan finns"}
        />
        <View>
          <Body>
            Lägg till bilder ({images.length}/{nrMaxImages})
          </Body>
          <Button onPress={onAddPicture} title="+" />
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
