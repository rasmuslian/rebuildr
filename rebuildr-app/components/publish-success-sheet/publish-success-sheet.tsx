import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Popup } from "@components/popup/popup";
import { Title, Body } from "@components/typography/text";
import { AdList } from "@components/ad/ad-list";
import { Button } from "@components/buttons/button";
import { PublishedProductData } from "@components/upsert-product/types";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { borderRadius } from "@constants/sizes";
import { Image } from "expo-image";
import { View } from "react-native";

type Props = {
  open: boolean;
  onDismiss: () => void;
  product: PublishedProductData | null;
};

export const PublishSuccessSheet = ({ open, onDismiss, product }: Props) => {
  const { isDesktop } = useScreenType();
  const colors = useThemeColor();

  const content = (
    <View style={{ alignItems: "center", gap: 16, paddingBottom: 8 }}>
      {product?.imageUrl && (
        <Image
          source={{ uri: product.imageUrl }}
          style={{ width: 98, height: 98, borderRadius: borderRadius.small }}
        />
      )}
      <View style={{ gap: 8, alignItems: "center" }}>
        <Title size="medium" style={{ textAlign: "center" }}>
          Utmärkt!
        </Title>
        <Body size="small" style={{ textAlign: "center" }}>
          Om ett par minuter är annonsen synlig på RebuildR.
        </Body>
      </View>
      {product && (
        <View
          style={{
            width: "100%",
            backgroundColor: colors.buttons.tonal.enabled,
            borderRadius: borderRadius.medium,
            paddingTop: 16,
            paddingBottom: 12,
            paddingHorizontal: 16,
          }}
        >
          <AdList
            title={product.title ?? ""}
            condition={product.condition}
            quantity={product.primaryQuantity}
            quantityUnit={product.primaryUnit}
            price={product.price}
            soldByQuantity={product.soldByQuantity}
            imageUrl={product.imageUrl}
          />
        </View>
      )}
    </View>
  );

  if (isDesktop) {
    return (
      <Popup open={open} onClose={onDismiss}>
        <View style={{ padding: 24 }}>
          <View style={{ alignItems: "flex-end", marginBottom: 16 }}>
            <Button icon="X" type="text" onPress={onDismiss} />
          </View>
          {content}
        </View>
      </Popup>
    );
  }

  const header = (
    <View style={{ marginTop: 8, marginBottom: 24 }}>
      <View style={{ alignItems: "center" }}>
        <View
          style={{
            width: 74,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.dividers.neutral,
          }}
        />
      </View>
      <View style={{ position: "absolute", right: 0, top: -8 }}>
        <Button icon="X" type="text" onPress={onDismiss} />
      </View>
    </View>
  );

  return (
    <BottomSheet
      name="publicerad-annons"
      open={open}
      onDismiss={onDismiss}
      header={header}
    >
      {content}
    </BottomSheet>
  );
};
