import React from "react";
import { View, Platform } from "react-native";
import { Body, Display, Headline } from "@components/typography/text";
import { Divider } from "@components/dividers/divider";
import { Check } from "@components/controls/check";
import { primitives } from "@constants/colors";
import { Button } from "@components/buttons/button";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

type Props = {
  productId: string;
  modalRef: React.RefObject<BottomSheetModal>;
};

export function CreateProductLabelModal({ productId, modalRef }: Props) {
  const howItWorksSteps = [
    "Köparen scannar QR-koden med mobilen",
    "Annonsen öppnas och köparen ser bilder och mer info om varan",
    "Köparen slutför köpet direkt i RebuildR",
  ];

  const print = async () => {
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

  return (
    <BottomSheet ref={modalRef} title="Skapa etikett" name="createLabel">
      <View style={{ gap: 24 }}>
        <Display size="small">
          Skriv ut en etikett och fäst den på din vara
        </Display>
        <Body size="medium">
          Etiketten innehåller en QR-kod som länkar till din annons.
        </Body>
        <Divider />

        <View style={{ gap: 16 }}>
          <Headline size="small">Så här funkar det</Headline>

          {howItWorksSteps.map((step) => (
            <View
              style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
            >
              <Check
                checkColor="primaryDark"
                selected
                color={primitives.primary200}
              />
              <Body size="medium">{step}</Body>
            </View>
          ))}
        </View>

        <View style={{ gap: 8 }}>
          <Button label="Skapa etikett for utskrift" onPress={print} />
          <Button
            type="tonal"
            label="Visa inte detta igen"
            onPress={() => {}}
          />
        </View>
      </View>
    </BottomSheet>
  );
}
