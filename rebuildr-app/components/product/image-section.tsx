import { Body, Display, Label, Title } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Icon } from "@icons/icon";
import { borderRadius } from "@constants/sizes";
import { FileType } from "../upsert-product/types";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { useImageHandler } from "@hooks/use-image-handler";

type Props = {
  compact?: boolean;
  images: FileType[];
  imageError?: string;
  onUpdateImages: (updatedImages: FileType[]) => void;
};

export const ImageSection = ({
  compact = false,
  images,
  imageError,
  onUpdateImages,
}: Props) => {
  const colors = useThemeColor();
  const { pickImage, pickImages } = useImageHandler();

  const onPickImage = async (index: number) => {
    const image = await pickImage();
    if (!image) return;
    const _selectedImages = [...images];

    _selectedImages[index] = {
      ...image,
      index,
      name: image.name,
    };

    onUpdateImages(_selectedImages);
  };

  const onPickMultipleImages = async (startIndex: number) => {
    const picked = await pickImages();
    if (!picked?.length) return;

    const _selectedImages = [...images];
    const slotsAvailable = 10 - images.length;
    picked.slice(0, slotsAvailable).forEach((image, i) => {
      const idx = startIndex + i;
      _selectedImages[idx] = { ...image, index: idx };
    });

    onUpdateImages(_selectedImages);
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
        borderBottomWidth: compact ? 0 : 1,
        borderColor: colors.dividers.neutral,
        paddingBottom: compact ? 0 : 16,
      }}
    >
      {compact ? (
        <Label size="small">Bilder</Label>
      ) : (
        <>
          <Display size="small" style={{ marginBottom: 16 }}>
            Lägg till bilder
          </Display>
          <Body size="large">
            Den första bilden du laddar upp blir omslagsbilden för din annons.
          </Body>
        </>
      )}
      {images.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          style={{ marginTop: compact ? 8 : 24 }}
        >
          {Array.from({
            length: images.length < 10 ? images.length + 1 : 10,
          }).map((_, _index) => {
            const existingImage = images?.find(({ index }) => index === _index);
            return (
              <ImageUploadCard
                key={_index}
                onImagePicked={
                  existingImage
                    ? () => onPickImage(_index)
                    : () => onPickMultipleImages(_index)
                }
                onImageRemoved={() => onImageRemoved(_index)}
                imageUri={existingImage?.uri}
                compact={compact}
              />
            );
          })}
        </ScrollView>
      ) : (
        <Pressable onPress={() => onPickMultipleImages(0)}>
          <View
            style={{
              borderRadius: borderRadius.medium,
              alignItems: "center",
              justifyContent: "center",
              padding: compact ? 10 : 16,
              borderStyle: "dashed",
              borderColor: colors.buttons.outlinedStroke.enabled,
              borderWidth: 1,
              marginTop: compact ? 8 : 24,
              gap: compact ? 6 : 16,
            }}
          >
            <View
              style={{
                width: compact ? 32 : 60,
                height: compact ? 32 : 60,
                backgroundColor: colors.card.message,
                borderRadius: 38,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon="addImage" />
            </View>
            {compact ? (
              <Label size="small">Lägg till bilder</Label>
            ) : (
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
            )}
          </View>
        </Pressable>
      )}
      {imageError && (
        <Body size="small" color="error" style={{ marginTop: 12 }}>
          {imageError}
        </Body>
      )}
      <Body
        size="small"
        style={{ marginTop: compact ? 6 : 12 }}
        color="secondary"
      >
        Bilder: {images.length} av 10
      </Body>
    </View>
  );
};

type ImageCardProps = {
  compact?: boolean;
  imageUri?: string;
  onImagePicked: () => void;
  onImageRemoved?: () => void;
};

export const ImageUploadCard = ({
  compact = false,
  imageUri,
  onImagePicked,
  onImageRemoved,
}: ImageCardProps) => {
  const [imageLoading, setImageLoading] = useState(false);

  const colors = useThemeColor();

  const width = compact ? 80 : 140;
  const height = compact ? 80 : 140;
  return (
    <Pressable
      onPress={onImagePicked}
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
              borderRadius: borderRadius.small,
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
                  backgroundColor: "#00000066",
                  opacity: 0.6,
                }}
              />
              <Pressable onPress={onImageRemoved}>
                <Icon icon="X" size={18} color="primaryLight" />
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
