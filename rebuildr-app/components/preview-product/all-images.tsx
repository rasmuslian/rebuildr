import { Headline } from "@components/typography/text";
import { useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { borderRadius } from "@constants/sizes";
import { useState } from "react";
import { AllImagesBottomSheet } from "./all-images-bottom-sheet";
import { Pressable } from "react-native-gesture-handler";

type Props = {
  images: { url: string }[];
  imagesPerRow?: number;
  parentWidth?: number;
  onAllImagesPress?: () => void;
};

export const AllImages = ({
  images,
  imagesPerRow,
  parentWidth,
  onAllImagesPress,
}: Props) => {
  const [showImagesSheet, setShowImagesSheet] = useState(false);
  const { width: screenWidth } = useWindowDimensions();

  const handleAllImagesPress = () => {
    if (onAllImagesPress) {
      onAllImagesPress();
    } else {
      setShowImagesSheet(true);
    }
  };

  if (imagesPerRow) {
    const rows = Math.ceil(images.length / imagesPerRow);
    const width = parentWidth
      ? Math.ceil((parentWidth - 16) / imagesPerRow)
      : 0;
    return (
      <View style={{ flex: 1 }}>
        <Headline size="small">Alla bilder</Headline>
        <Pressable onPress={handleAllImagesPress}>
          <View style={{ gap: 8, marginTop: 16 }}>
            {rows &&
              Array(rows)
                .fill(1)
                .map((_, row) => (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      marginTop: 16,
                      gap: 8,
                    }}
                  >
                    {images
                      .slice(row * imagesPerRow, (row + 1) * imagesPerRow)
                      .map((image, i) => (
                        <Image
                          key={i}
                          source={image.url}
                          style={{
                            aspectRatio: 1,
                            width,
                            borderRadius: borderRadius.medium,
                          }}
                        />
                      ))}
                  </View>
                ))}
          </View>
        </Pressable>
        <AllImagesBottomSheet
          images={images}
          show={showImagesSheet}
          onDismiss={() => setShowImagesSheet(false)}
        />
      </View>
    );
  }
  const width = (screenWidth - 48) / 3;

  return (
    <View>
      <Headline size="small">Alla bilder</Headline>
      <Pressable onPress={handleAllImagesPress}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 16,
          }}
        >
          {images.map((image, i) => (
            <Image
              key={i}
              source={image.url}
              style={{
                aspectRatio: 1,
                width,
                borderRadius: borderRadius.medium,
              }}
            />
          ))}
        </View>
      </Pressable>
      <AllImagesBottomSheet
        images={images}
        show={showImagesSheet}
        onDismiss={() => setShowImagesSheet(false)}
      />
    </View>
  );
};
