import { useCallback } from "react";
import { Platform } from "react-native";
import { RECEIPT_HOST_ID } from "@components/purchase/receipt-section";

const CLONE_ID = "receipt-print-clone";
const STYLE_ATTR = "data-receipt-print";

export const usePrintReceipt = () => {
  const print = useCallback(() => {
    if (Platform.OS !== "web") return;

    const el = document.getElementById(RECEIPT_HOST_ID);
    if (!el) return;

    document.getElementById(CLONE_ID)?.remove();
    document
      .querySelectorAll(`style[${STYLE_ATTR}]`)
      .forEach((s) => s.remove());

    const clone = el.cloneNode(true) as HTMLElement;
    clone.id = CLONE_ID;
    document.body.appendChild(clone);

    const style = document.createElement("style");
    style.setAttribute(STYLE_ATTR, "1");
    style.textContent = `
      @page { size: A4; margin: 0; }
      @media print {
        html, body { margin: 0 !important; padding: 0 !important; height: auto !important; }
        body > *:not(#${CLONE_ID}) { display: none !important; }
        #${CLONE_ID} {
          width: 200mm !important;
          max-height: 263mm !important;
          margin: 0 !important;
          padding: 8mm !important;
          box-sizing: border-box;
          overflow: hidden !important;
        }
        #receipt-print-button { display: none !important; }
        #receipt-co2-read-more { display: none !important; }
      }
    `;
    document.head.appendChild(style);

    window.onafterprint = () => {
      style.remove();
      clone.remove();
      window.onafterprint = null;
    };
    window.print();
  }, []);

  return { print };
};
