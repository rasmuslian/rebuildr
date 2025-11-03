import { AdGrid } from "@components/ad/ad-grid";
import { router } from "expo-router";
import { View } from "react-native";
import { LocationObjectCoords } from "expo-location";
import { OrderProductsEnum, NewArrivalsQuery } from "@/gql/graphql";
import { SectionHeader } from "@components/sections/section-header";

type Props = {
  data?: NewArrivalsQuery;
  location?: LocationObjectCoords | null;
  setSorting: (order: OrderProductsEnum, reset: boolean) => void;
  onToggleProductHeart: (args: {
    productId: string;
    likedByMe: boolean;
  }) => void;
};

export const NewArrivalsDesktop = ({
  data,
  location,
  setSorting,
  onToggleProductHeart,
}: Props) => {
  if (!data || data.products.products.length < 1) return null;

  return (
    <View style={{ paddingTop: 16, paddingBottom: 24 }}>
      <SectionHeader
        onPress={() => {
          if (location) {
            setSorting(OrderProductsEnum.Distance, true);
          } else {
            setSorting(OrderProductsEnum.Latest, true);
          }
          router.navigate("/(app)/(tabs)/search/products");
        }}
        buttonTitle="Visa alla"
      >
        {location ? "Nyinkomna varor nära dig" : "Nyinkomna varor"}
      </SectionHeader>
      <View style={{ flexDirection: "row", gap: 16, paddingTop: 16 }}>
        {data?.products?.products?.map((item) => (
          <View style={{ flex: 1 }} key={item.id}>
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
              status={item.status}
              onHeartPress={() => {
                onToggleProductHeart({
                  productId: item.id,
                  likedByMe: !!item.likedByMe,
                });
              }}
            />
          </View>
        ))}
      </View>
    </View>
  );
};
