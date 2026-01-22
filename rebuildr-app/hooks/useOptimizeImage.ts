import * as ImageManipulator from "expo-image-manipulator";
export const useOptimizeImage = () => {
  const optimizeImage = async (_uri: string, _mimeType?: string) => {
    let uri: string = _uri;

    //Browsers can't handle heic or heif images which is a format from iphones
    //convert it to jpeg before proceeding
    if (/(heic|heif)/.test(_mimeType ?? "")) {
      if (typeof window === "undefined") {
        throw new Error("HEIC conversion can only run in the browser");
      }

      const { default: heic2any } = await import("heic2any");

      const response = await fetch(_uri);
      const blob = await response.blob();

      const jpegBlob = await heic2any({
        blob,
        toType: "image/jpeg",
        quality: 0.9,
      });

      const singleBlob = Array.isArray(jpegBlob) ? jpegBlob[0] : jpegBlob;

      uri = URL.createObjectURL(singleBlob);
    }

    const context = ImageManipulator.ImageManipulator.manipulate(uri);
    context.resize({ width: 800 });
    const img = await context.renderAsync();
    const res = await img.saveAsync({
      format: ImageManipulator.SaveFormat.JPEG,
      compress: 1,
    });
    const response = await fetch(res.uri);
    const blob = await response.blob();
    const optimizedFile = new File([blob], `${Date.now()}.${blob.type}`, {
      type: blob.type,
    });
    return {
      file: optimizedFile,
      mimeType: blob.type,
      uri: res.uri,
      size: blob.size,
    };
  };

  return { optimizeImage };
};
