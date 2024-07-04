import { useMutation, useQuery } from "@apollo/client";
import React, { useMemo, useState } from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import { gql } from "src/gql";
import { Button } from "src/components/button";
import { Input } from "src/components/inputs/input";
import { Page } from "src/components/page";
import { Picker } from "@react-native-picker/picker";
import { NumberInput } from "src/components/inputs/numberInput";
import { Body } from "src/components/texts/text";
import * as ImagePicker from "expo-image-picker";
import Colors from "src/styles/colors";
import {
  ImageResult,
  manipulateAsync,
  SaveFormat,
} from "expo-image-manipulator";

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

const IMAGE_WIDTH = 300;
const IMAGE_CONTAINER_WIDTH = IMAGE_WIDTH + 20;

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
  const [images, setImages] = useState<(ImageResult & { mimeType: string })[]>(
    [],
  );
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<{
    title: string;
    category: { name: string };
    price: number;
  }>();
  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const { data, loading } = useQuery(SELL_QUERY, {
    onCompleted: (data) => setAddress(data.me.address ?? ""),
  });

  const [createProduct] = useMutation(CREATE_PRODUCT);

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

  const onAddImage = async () => {
    if (nrMaxImages - images.length === 0) {
      return;
    }

    //If permission to use file media library is denied, ask again and return if still denied.
    if (!status.granted) {
      if (!status.canAskAgain) {
        return;
      }

      const newRequest = await requestPermission();
      if (!newRequest.granted) {
        return;
      }
    }

    //select image from system
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (result.canceled) {
      return;
    }

    //ignore files whose mimeType could not be determined
    const filteredResults = result.assets.filter((asset) => !!asset.mimeType);

    //compress the images
    const manipulatedImages = await Promise.all(
      filteredResults.map(async (filterResult) => {
        const actions =
          filterResult.width > IMAGE_WIDTH
            ? [{ resize: { width: IMAGE_WIDTH } }]
            : [];

        const mimeType =
          filterResult.mimeType === "image/png" ? "image/png" : "image/jpeg";
        const manipulatedImage = await manipulateAsync(
          filterResult.uri,
          actions,
          {
            compress: 0.7,
            format: mimeType === "image/png" ? SaveFormat.PNG : SaveFormat.JPEG,
          },
        );

        return { ...manipulatedImage, mimeType };
      }),
    );

    setImages([...images, ...manipulatedImages]);
  };

  const onRemoveImage = (indexToRemove: number) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setImages(updatedImages);
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

    setCreatingProduct(true);
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
      onCompleted: async (data) => {
        setCreatedProduct(data.createProduct.product);

        try {
          //send all images
          await Promise.all(
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
          );
        } catch (e) {
          console.log("Error when uploading images :>> ", e);
        }

        setCreatingProduct(false);

        //reset
        setTitle("");
        setSelectedChildCategory(undefined);
        setSelectedRootCategory(undefined);
        setPrice(undefined);
        setAddress("");
        setImages([]);
      },
      onError: () => {
        setCreatingProduct(false);
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
        <View style={styles.imagesContainer}>
          {images.map((image, i) => (
            <View key={i} style={styles.imageContainer}>
              <Image
                resizeMode="center"
                style={{
                  height: image.height,
                  width: image.width,
                }}
                source={{ uri: image.uri }}
              />
              <Pressable
                onPress={() => onRemoveImage(i)}
                style={styles.removeImage}
              >
                <Body size="small">Ta bort</Body>
              </Pressable>
            </View>
          ))}
        </View>
        <View style={styles.addImageContainer}>
          <Body>
            Lägg till bilder ({images.length}/{nrMaxImages})
          </Body>
          <Button onPress={onAddImage} title="+" />
        </View>

        <Button
          title="Publicera"
          titleColor="white"
          onPress={onPublish}
          disabled={creatingProduct}
          backgroundColor="purple"
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
  imagesContainer: {
    flexDirection: "row",
    maxWidth: IMAGE_CONTAINER_WIDTH * 2 + 10,
    gap: 10,
    flexWrap: "wrap",
  },
  imageContainer: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 20,
    backgroundColor: Colors.white,
    minHeight: 260,
    width: IMAGE_CONTAINER_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImage: {
    position: "absolute",
    right: 20,
    bottom: 5,
  },
  addImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
