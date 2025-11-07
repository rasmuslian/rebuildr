import { AdGrid } from "@components/ad/ad-grid";
import { View } from "react-native";
import { SectionHeader } from "@components/sections/section-header";
import { AdRowSectionQuery } from "@/gql/graphql";

type Props = {
  data: AdRowSectionQuery;
  onPress: () => void;
  title: string;
  onToggleProductHeart: (args: {
    productId: string;
    likedByMe: boolean;
  }) => void;
};

export const AdRowSectionDesktop = ({
  data,
  onPress,
  title,
  onToggleProductHeart,
}: Props) => {
  if (!data || data.products.products.length < 1) return null;

  return (
    <View style={{ paddingTop: 16, paddingBottom: 24 }}>
      <SectionHeader onPress={() => onPress()} buttonTitle="Visa alla">
        {title}
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
