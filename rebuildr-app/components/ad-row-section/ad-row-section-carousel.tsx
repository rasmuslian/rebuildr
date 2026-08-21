import { HoriztalListSection } from "@components/sections/horizontal-list-section";
import { AdGrid } from "@components/ad/ad-grid";
import { View } from "react-native";
import { AdRowSectionQuery, ProductAvailabilityEnum } from "@/gql/graphql";
import { DESKTOP_ROW_COLUMNS } from "@constants/layout";

type Props = {
  data: AdRowSectionQuery;
  onPress: () => void;
  title: string;
  buttonTitle?: string;
  onToggleProductHeart: (args: {
    productId: string;
    likedByMe: boolean;
  }) => void;
};

export const AdRowSectionCarousel = ({
  data,
  onPress,
  title,
  buttonTitle,
  onToggleProductHeart,
}: Props) => {
  if (!data || data.products.products.length < 1) return null;

  return (
    <View style={{ paddingTop: 16, paddingBottom: 24 }}>
      <HoriztalListSection
        title={title}
        buttonTitle={buttonTitle}
        data={data?.products.products ?? []}
        onPress={() => onPress()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
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
