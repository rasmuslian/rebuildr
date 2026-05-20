import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

type Props = {
  productId: string;
};

// Native-only. Web printing is handled in-page by the product page via
// <ProductLabelSheet /> so users in PWA standalone mode aren't trapped in a
// detached browser overlay.
export const printProductLabel = async ({ productId }: Props) => {
  if (Platform.OS === "web") return;
  const response = await fetch(`/product-label/${productId}`);
  const html = await response.text();
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri);
};
