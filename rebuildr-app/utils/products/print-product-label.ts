import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

type Props = {
  productId: string;
};

export const printProductLabel = async ({ productId }: Props) => {
  if (Platform.OS === "web") {
    const printWindow = window.open(`/product-label/${productId}`, "_blank");
    if (!printWindow) return;

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.onafterprint = () => printWindow.close();
        printWindow.print();
      }, 500);
    };
  } else {
    const response = await fetch(`/product-label/${productId}`);
    const html = await response.text();
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  }
};
