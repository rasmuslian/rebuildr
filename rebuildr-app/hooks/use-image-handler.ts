import { launchImageLibraryAsync } from "expo-image-picker";
import { useOptimizeImage } from "./useOptimizeImage";

export const useImageHandler = () => {
  const { optimizeImage } = useOptimizeImage();

  const pickImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result?.canceled) return;
    const image = result?.assets[0];

    if (!image) return;

    const uri = image.uri;
    const {
      mimeType,
      file,
      uri: optimizedImageUri,
      size,
    } = await optimizeImage(uri, image.mimeType);

    const _image = {
      uri: optimizedImageUri,
      mimeType,
      file,
      size,
      name: image.fileName,
    };
    return _image;
  };

  const pickImages = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
    });

    if (result?.canceled || !result?.assets?.length) return;

    return Promise.all(
      result.assets.map(async (image) => {
        const {
          mimeType,
          file,
          uri: optimizedImageUri,
          size,
        } = await optimizeImage(image.uri, image.mimeType);

        return {
          uri: optimizedImageUri,
          mimeType,
          file,
          size,
          name: image.fileName,
        };
      }),
    );
  };

  return {
    pickImage,
    pickImages,
  };
};
