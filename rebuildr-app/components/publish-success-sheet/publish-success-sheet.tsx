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
import { Icon } from "@icons/icon";
import { primitives } from "@constants/colors";
import { useUser } from "@hooks/useUser";
import { router } from "expo-router";
import { ProjectSuggestionCard } from "./project-suggestion-card";

type Props = {
  open: boolean;
  onDismiss: () => void;
  product: PublishedProductData | null;
};

export const PublishSuccessSheet = ({ open, onDismiss, product }: Props) => {
  const { isDesktop } = useScreenType();
  const colors = useThemeColor();
  const user = useUser();

  const content = (
    <View style={{ alignItems: "center", gap: 16, paddingBottom: 8 }}>
      {product?.imageUrl && (
        <View>
          <Image
            source={{ uri: product.imageUrl }}
            style={{ width: 98, height: 98, borderRadius: borderRadius.small }}
          />
          <View
            style={{
              borderRadius: 300,
              backgroundColor: primitives.primary400,
              padding: 8,
              position: "absolute",
              right: -10,
              top: -10,
            }}
          >
            <Icon icon="check" color="primaryLight" size={18} />
          </View>
        </View>
      )}
      <View style={{ gap: 8, alignItems: "center" }}>
        <Title size="medium" style={{ textAlign: "center" }}>
          Utmärkt!
        </Title>
        {user.me && (
          <Body size="small" style={{ textAlign: "center" }}>
            Din annons är nu publicerad på RebuildR. Andra kan se den i flödet,
            och du hittar den själv under{" "}
            <Body
              size="small"
              onPress={() => {
                router.navigate({
                  pathname: "/product-list/[userId]",
                  params: { userId: user.me!.id },
                });
                onDismiss();
              }}
            >
              Dina annonser
            </Body>
            .
          </Body>
        )}
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
            marginTop: 8,
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
      {product?.productId && user.me && (
        <ProjectSuggestionCard
          productId={product.productId}
          sellerId={user.me.id}
          onDismiss={onDismiss}
        />
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

  return (
    <BottomSheet
      name="publicerad-annons"
      open={open}
      onDismiss={onDismiss}
      title="Din annons har publicerats!"
    >
      {content}
    </BottomSheet>
  );
};
