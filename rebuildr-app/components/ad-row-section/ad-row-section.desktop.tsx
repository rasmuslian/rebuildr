import { AdGrid } from "@components/ad/ad-grid";
import { View } from "react-native";
import { SectionHeader } from "@components/sections/section-header";
import {
  AdRowSectionQuery,
  ProductConditionEnum,
  ProductStatusEnum,
  QuantityUnitEnum,
} from "@/gql/graphql";

type Props = {
  products?: {
    id: string;
    title: string;
    status: ProductStatusEnum;
    likedByMe?: boolean | null;
    primaryQuantity?: number | null;
    primaryUnit?: QuantityUnitEnum | null;
    condition: ProductConditionEnum;
    price: number;
    distanceFromLocation?: number | null;
    primaryImage?: {
      __typename?: "File";
      id: string;
      url: string;
    } | null;
    category?: {
      __typename?: "Category";
      id: string;
      name: string;
    } | null;
    seller?: {
      __typename?: "User";
      id: string;
    };
  }[];
  me?: AdRowSectionQuery["me"];
  onPress: () => void;
  title: string;
  onToggleProductHeart: (args: {
    productId: string;
    likedByMe: boolean;
  }) => void;
};

export const AdRowSectionDesktop = ({
  products,
  me,
  onPress,
  title,
  onToggleProductHeart,
}: Props) => {
  if (!products || products.length < 1) return null;

  if (products.length < 4) {
    products = [...products, ...Array(4 - products.length).fill(null)];
  }

  return (
    <View style={{ paddingTop: 16, paddingBottom: 24 }}>
      <SectionHeader onPress={() => onPress()} buttonTitle="Visa alla">
        {title}
      </SectionHeader>
      <View style={{ flexDirection: "row", gap: 16, paddingTop: 16 }}>
        {products.map((item) => {
          if (!item) {
            return <View style={{ flex: 1 }} key={Math.random().toString()} />;
          }
          return (
            <View style={{ flex: 1 }} key={item.id}>
              <AdGrid
                id={item.id}
                imageUri={item.primaryImage?.url}
                liked={!!item.likedByMe}
                heart={item.seller?.id !== me?.id}
                quantity={item.primaryQuantity}
                quantityUnit={item.primaryUnit}
                condition={item.condition}
                title={item.title}
                price={item.price}
                status={item.status}
                distance={item.distanceFromLocation}
                onHeartPress={() => {
                  onToggleProductHeart({
                    productId: item.id,
                    likedByMe: !!item.likedByMe,
                  });
                }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};
