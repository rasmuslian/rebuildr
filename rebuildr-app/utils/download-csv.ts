import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

const safeFileName = (fileName: string) =>
  fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

export const downloadCsv = async (csv: string, fileName: string) => {
  const normalizedFileName = safeFileName(fileName);

  if (Platform.OS === "web") {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = normalizedFileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    return;
  }

  if (!FileSystem.cacheDirectory || !(await Sharing.isAvailableAsync())) {
    throw new Error("CSV sharing is not available");
  }
  const uri = `${FileSystem.cacheDirectory}${normalizedFileName}`;
  await FileSystem.writeAsStringAsync(uri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(uri, {
    dialogTitle: "Ladda ner underlag",
    mimeType: "text/csv",
    UTI: "public.comma-separated-values-text",
  });
};
