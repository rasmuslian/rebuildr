import { View, Image, ScrollView } from "react-native";
import { borderRadius } from "@constants/sizes";
import { useEffect, useState } from "react";

type Props = {
  images: { url: string }[];
};

export const AllImagesPopupContent = ({ images }: Props) => {
  return (
    <ScrollView
      style={{
        width: "100%",
      }}
      contentContainerStyle={{
        gap: 16,
        flex: 1,
        paddingVertical: 24,
        width: "100%",
      }}
    >
      {images.map((image, i) => (
        <DynamicImage uri={image.url} key={i}/>
      ))}
      <View style={{ height: 8 }} />
    </ScrollView>
  );
};

const DynamicImage = ({ uri }: { uri: string }) => {
  const [aspectRatio, setAspectRatio] = useState(1);

  useEffect(() => {
    Image.getSize(uri, (w, h) => {
      setAspectRatio(w / h);
    });
  }, [uri]);

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        borderRadius: borderRadius.medium,
      }}
    >
      <Image
        source={{ uri }}
        style={{
          width: 640,
          aspectRatio,
          borderRadius: borderRadius.medium,
        }}
        resizeMode="contain"
      />
    </View>
  );
};
