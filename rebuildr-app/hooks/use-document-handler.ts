import * as DocumentPicker from "expo-document-picker";

export const useDocumentHandler = () => {
  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "image/*",
        "application/pdf", // .pdf
        "application/msword", // .doc
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
        "text/plain", // .txt
      ],
    });
    if (result?.canceled) return;
    const document = result.assets?.[0];
    if (!document) {
      return;
    }
    if (!document.mimeType) {
      throw new Error("Unsupported or unknown document type");
    }
    if (!document.size) {
      throw new Error("Document has no size");
    }

    const blob = await fetch(document.uri).then((res) => res.blob());
    const file = new File([blob], document.name, { type: document.mimeType });

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
