import { HoriztalListSection } from "@components/sections/horizontal-list-section";
import { AdGrid } from "@components/ad/ad-grid";
import { ProductInlineBannerSlot } from "@components/banners/product-inline-banner";
import { View } from "react-native";
import { AdRowSectionQuery, ProductAvailabilityEnum } from "@/gql/graphql";
import { DESKTOP_ROW_COLUMNS } from "@constants/layout";

type Product = AdRowSectionQuery["products"]["products"][number];
type RowItem = Product | { id: "product-inline-banner"; isInlineBanner: true };

const INLINE_BANNER_AFTER_PRODUCT_INDEX = 1;

type Props = {
  data: AdRowSectionQuery;
  onPress: () => void;
  title: string;
  buttonTitle?: string;
  onToggleProductHeart: (args: {
    productId: string;
    likedByMe: boolean;
  }) => void;
  showInlineBanner?: boolean;
};

export const AdRowSectionCarousel = ({
  data,
  onPress,
  title,
  buttonTitle,
  onToggleProductHeart,
  showInlineBanner = false,
}: Props) => {
  if (!data || data.products.products.length < 1) return null;

  const inlineBannerAfterIndex = Math.min(
    INLINE_BANNER_AFTER_PRODUCT_INDEX,
    data.products.products.length - 1,
  );
  const items: RowItem[] = data.products.products.flatMap((product, index) => {
    if (!showInlineBanner || index !== inlineBannerAfterIndex) {
      return [product];
    }
    return [product, { id: "product-inline-banner", isInlineBanner: true }];
  });

  return (
    <View style={{ paddingTop: 16, paddingBottom: 24 }}>
      <HoriztalListSection
        title={title}
        buttonTitle={buttonTitle}
        data={items}
        onPress={() => onPress()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          if ("isInlineBanner" in item) {
            return <ProductInlineBannerSlot />;
          }

          return (
            <AdGrid
              id={item.id}
              imageUri={item.primaryImage?.url}
              liked={!!item.likedByMe}
              heart={item.seller.id !== data.me?.id}
              quantity={item.primaryQuantity}
              quantityUnit={item.primaryUnit}
              condition={item.condition}
              title={item.title}
              price={item.price}
              soldByQuantity={item.soldByQuantity}
              status={item.status}
              upcoming={item.availability === ProductAvailabilityEnum.Upcoming}
              distance={item.distanceFromLocation}
              onHeartPress={() => {
                onToggleProductHeart({
                  productId: item.id,
                  likedByMe: !!item.likedByMe,
                });
              }}
            />
          );
        }}
        visibleItems={3}
        visibleItemsDesktop={DESKTOP_ROW_COLUMNS}
      />
    </View>
  );
};
