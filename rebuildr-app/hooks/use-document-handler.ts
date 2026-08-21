import * as DocumentPicker from "expo-document-picker";

export const useDocumentHandler = () => {
  const fileTypes = [
    "image/*",
    "application/pdf", // .pdf
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "text/csv", // .csv
    "text/markdown", // .md
    "text/plain", // .txt
  ];

  const toFile = async (document: DocumentPicker.DocumentPickerAsset) => {
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

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: fileTypes,
    });
    if (result?.canceled) return;
    const document = result.assets?.[0];
    if (!document) {
      return;
    }
    return toFile(document);
  };

  const pickDocuments = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: fileTypes,
      multiple: true,
    });
    if (result?.canceled || !result.assets?.length) return;
    return Promise.all(result.assets.map(toFile));
  };

  return {
    pickDocument,
    pickDocuments,
  };
};
