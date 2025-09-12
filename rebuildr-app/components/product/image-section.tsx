import { Body, Display, Title } from "@components/typography/text";
import { useOptimizeImage } from "@hooks/useOptimizeImage";
import { useThemeColor } from "@hooks/useThemeColor";
import { ImagePickerResult, launchImageLibraryAsync } from "expo-image-picker";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Icon } from "@icons/icon";
import { borderRadius } from "@constants/sizes";
import { primitives } from "@constants/colors";
import { FileType } from "./types";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";

type Props = {
  images: FileType[];
  imageError?: string;
  onUpdateImages: (updatedImages: FileType[]) => void;
};

export const ImageSection = ({ images, imageError, onUpdateImages }: Props) => {
  const colors = useThemeColor();
  const { optimizeImage } = useOptimizeImage();

  const pickImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
    });

    onImagePicked(result, 0);
  };

  const onImagePicked = async (result: ImagePickerResult, index: number) => {
    if (result?.canceled) return;
    const image = result?.assets[0];
    if (image) {
      const _selectedImages = [...images];
      const uri = image.uri;
      const optimizedImage = await optimizeImage(uri);
      if (!optimizedImage) {
        return;
      }
      const { mimeType, file, uri: optimizedImageUri, size } = optimizedImage;

      _selectedImages[index] = {
        uri: optimizedImageUri,
        index,
        mimeType,
        file,
        size,
        name: image.fileName,
      };
      onUpdateImages(_selectedImages);
    }
  };

  const onImageRemoved = async (index: number) => {
    const _selectedImages = images.reduce((acc: FileType[], curr) => {
      if (curr.index < index) {
        return [...acc, curr];
      }

      if (curr.index === index) {
        return acc;
      }

      return [...acc, { ...curr, index: curr.index - 1 }];
    }, []);
    onUpdateImages(_selectedImages);
  };

  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderColor: colors.dividers.neutral,
        paddingBottom: 16,
      }}
    >
      <Display size="small" style={{ marginBottom: 16 }}>
        Bilder
      </Display>
      <Body size="large" style={{ marginBottom: 18 }}>
        Den första bilden du laddar upp blir omslagsbilden för din annons.
      </Body>
      <Body size="large">Du måste ladda upp minst en bild.</Body>
      {images.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          style={{ marginTop: 24 }}
        >
          {Array.from({
            length: images.length < 5 ? images.length + 1 : 5,
          }).map((_, _index) => (
            <ImageUploadCard
              key={_index}
              onImagePicked={(res) => onImagePicked(res, _index)}
              onImageRemoved={() => onImageRemoved(_index)}
              imageUri={images?.find(({ index }) => index === _index)?.uri}
            />
          ))}
        </ScrollView>
      ) : (
        <Pressable onPress={() => pickImage()}>
          <View
            style={{
              borderRadius: borderRadius.medium,
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              borderStyle: "dashed",
              borderColor: colors.buttons.outlinedStroke.enabled,
              borderWidth: 1,
              marginTop: 24,
              gap: 16,
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: colors.card.message,
                borderRadius: 38,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon="addImage" />
            </View>
            <View style={{ gap: 4 }}>
              <Title size="medium" style={{ textAlign: "center" }}>
                Ladda upp bilder
              </Title>
              <Body
                size="small"
                color="secondary"
                style={{ textAlign: "center" }}
              >
                Tryck för att ladda upp bilder här.
              </Body>
            </View>
          </View>
        </Pressable>
      )}
      {imageError && (
        <Body size="small" color="error" style={{ marginTop: 12 }}>
          {imageError}
        </Body>
      )}
      <Body size="small" style={{ marginTop: 12 }} color="secondary">
        Bilder: {images.length} av 10
      </Body>
    </View>
  );
};

type ImageCardProps = {
  imageUri?: string;
  onImagePicked: (result: ImagePickerResult) => void;
  onImageRemoved?: () => void;
};

export const ImageUploadCard = ({
  imageUri,
  onImagePicked,
  onImageRemoved,
}: ImageCardProps) => {
  const [imageLoading, setImageLoading] = useState(false);

  const pickImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
    });

    onImagePicked(result);
  };
  const colors = useThemeColor();

  const width = 140;
  const height = 140;
  return (
    <Pressable
      onPress={pickImage}
      style={{
        height,
        width,
        borderRadius: borderRadius.medium,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {imageUri ? (
        <View
          style={{
            width: "100%",
            height: "100%",
            borderRadius: borderRadius.medium,
            position: "relative",
          }}
        >
          <Image
            source={{ uri: imageUri }}
            onLoadEnd={() => setImageLoading(false)}
            onLoad={() => setImageLoading(true)}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 15,
            }}
          />
          {imageLoading && (
            <View
              style={{
                position: "absolute",
                width: 32,
                height: 32,
                left: 50,
                top: 50,
              }}
            >
              <LoadingSpinner />
            </View>
          )}
          {onImageRemoved && (
            <View
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                borderRadius: borderRadius.medium,
                width: 32,
                height: 32,
                padding: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  borderRadius: borderRadius.medium,
                  width: 32,
                  height: 32,
                  padding: 8,
                  backgroundColor: primitives.primary100,
                  opacity: 0.4,
                }}
              />
              <Pressable onPress={onImageRemoved}>
                <Icon icon="X" size={18} />
              </Pressable>
            </View>
          )}
        </View>
      ) : (
        <View
          style={{
            width,
            height,
            borderRadius: borderRadius.medium,
            alignItems: "center",
            justifyContent: "center",
            borderStyle: "dashed",
            borderColor: colors.buttons.outlinedStroke.enabled,
            borderWidth: 1,
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              backgroundColor: colors.card.message,
              borderRadius: 38,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon="addImage" />
          </View>
        </View>
      )}
    </Pressable>
  );
};
