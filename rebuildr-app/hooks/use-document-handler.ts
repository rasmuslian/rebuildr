import * as DocumentPicker from "expo-document-picker";

export const useDocumentHandler = () => {
  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf", // .pdf
        "application/msword", // .doc
        "text/plain", // .txt
      ],
    });
    if (result?.canceled) return;
    const document = result.assets?.[0];
    if (!document) {
      return;
    }
    const blob = await fetch(document.uri).then((res) => res.blob());
    const file = new File([blob], document.name);

    if (!document.mimeType) {
      throw new Error("Unsupported or unknows document type");
    }
    if (!document.size) {
      throw new Error("Document has no size");
    }

    return {
      ...document,
      mimeType: document.mimeType,
      file,
      name: document.name,
      size: document.size,
    };
  };

  return {
    pickDocument,
  };
};
