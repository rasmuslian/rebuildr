import * as ImageManipulator from "expo-image-manipulator";
export const useOptimizeImage = () => {
  const optimizeImage = async (uri: string) => {
    const optimizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    const response = await fetch(optimizedImage.uri);
    const blob = await response.blob();
    const optimizedFile = new File([blob], `${Date.now()}.${blob.type}`, {
      type: blob.type,
    });
    return {
      file: optimizedFile,
      mimeType: blob.type,
      uri: optimizedImage.uri,
      size: blob.size,
    };
  };

  return { optimizeImage };
};
