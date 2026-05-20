import { useCallback, useState } from "react";
import { Platform } from "react-native";
import { printProductLabel } from "@/utils/products/print-product-label";
import { PRODUCT_LABEL_HOST_ID } from "@components/product-label/product-label-sheet";

const CLONE_ID = "product-label-print-clone";
const STYLE_ATTR = "data-product-label-print";

export const usePrintProductLabel = (productId: string) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handleReady = useCallback(() => {
    if (Platform.OS !== "web") return;
    const el = document.getElementById(PRODUCT_LABEL_HOST_ID);
    if (!el) return;

    document.getElementById(CLONE_ID)?.remove();
    document
      .querySelectorAll(`style[${STYLE_ATTR}]`)
      .forEach((s) => s.remove());

    const clone = el.cloneNode(true) as HTMLElement;
    clone.id = CLONE_ID;
    clone.style.position = "static";
    clone.style.left = "0";
    clone.style.top = "0";
    document.body.appendChild(clone);

    const style = document.createElement("style");
    style.setAttribute(STYLE_ATTR, "1");
    style.textContent = `
      @page { size: A4; margin: 12px; }
      @media print {
        body > *:not(#${CLONE_ID}) { display: none !important; }
        #${CLONE_ID} { display: flex !important; }
      }
    `;
    document.head.appendChild(style);

    const cleanup = () => {
      style.remove();
      clone.remove();
      window.onafterprint = null;
      setIsPrinting(false);
    };
    window.onafterprint = cleanup;
    window.print();
  }, []);

  const print = useCallback(() => {
    if (Platform.OS === "web") {
      setIsPrinting(true);
    } else {
      printProductLabel({ productId });
    }
  }, [productId]);

  return { isPrinting, print, handleReady };
};
