import React from "react";
import { View } from "react-native";
import { Body, Display, Headline } from "@components/typography/text";
import { Divider } from "@components/dividers/divider";
import { Check } from "@components/controls/check";
import { primitives } from "@constants/colors";
import { Button } from "@components/buttons/button";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { useScreenType } from "@hooks/useScreenType";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";

type Props = {
  show: boolean;
  onDismiss: () => void;
  onPressPrintProductLabel: () => void;
  onPressDontShowMore: () => void;
};

export function CreateProductLabelModal({
  show,
  onDismiss,
  onPressPrintProductLabel,
  onPressDontShowMore,
}: Props) {
  const { isDesktop } = useScreenType();

  if (isDesktop) {
    return (
      <SlideInSheet open={show} onClose={onDismiss} title="Skapa etikett">
        <CreateProductLabelContent
          onPressPrintProductLabel={onPressPrintProductLabel}
          onPressDontShowMore={onPressDontShowMore}
        />
      </SlideInSheet>
    );
  }

  return (
    <BottomSheet
      open={show}
      onDismiss={onDismiss}
      title="Skapa etikett"
      name="createLabel"
    >
      <CreateProductLabelContent
        onPressPrintProductLabel={onPressPrintProductLabel}
        onPressDontShowMore={onPressDontShowMore}
      />
    </BottomSheet>
  );
}

type ContentProps = {
  onPressPrintProductLabel: () => void;
  onPressDontShowMore: () => void;
};

export const CreateProductLabelContent = ({
  onPressPrintProductLabel,
  onPressDontShowMore,
}: ContentProps) => {
  const howItWorksSteps = [
    "Köparen scannar QR-koden med mobilen",
    "Annonsen öppnas och köparen ser bilder och mer info om varan",
    "Köparen slutför köpet direkt i RebuildR",
  ];

  return (
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

        {howItWorksSteps.map((step, index) => (
          <View
            key={index}
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
        <Button
          label="Skapa etikett för utskrift"
          onPress={onPressPrintProductLabel}
        />
        <Button
          type="tonal"
          label="Visa inte detta igen"
          onPress={onPressDontShowMore}
        />
      </View>
    </View>
  );
};
