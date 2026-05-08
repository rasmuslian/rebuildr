import { Product, Purchase, User } from "@/gql/graphql";
import { getProductBadgeProps } from "@/utils/getProductBadgeProps";
import { Header } from "@components/navigation/headers/header";
import { ProductHeader } from "@components/navigation/headers/product-header";
import { useChatHeaderNavigation } from "@hooks/use-chat-header-navigation";
import { useScreenType } from "@hooks/useScreenType";
import { View } from "react-native";

type Props = {
  otherUser: User;
  product: Product;
  purchase?: Purchase | null;
  sellerIsMe: boolean;
};
export const ChatHeader = ({
  otherUser,
  product,
  purchase,
  sellerIsMe,
}: Props) => {
  const { isDesktop } = useScreenType();
  const { action: headerAction, disabled: headerActionDisabled } =
    useChatHeaderNavigation({
      productId: product.id,
      productStatus: product.status,
      role: sellerIsMe ? "seller" : "buyer",
      purchase,
    });
  const statusBadgeProps = getProductBadgeProps(
    product.status,
    sellerIsMe ? "seller" : "buyer",
    purchase,
  );
  return (
    <View style={{ gap: 16 }}>
      <Header title={otherUser?.username} showBackButton={!isDesktop} />
      <ProductHeader
        id={product.id}
        title={product.title}
        price={product.price}
        condition={product.condition}
        quantity={purchase?.purchasedQuantity ?? product.primaryQuantity}
        quantityUnit={product.primaryUnit}
        soldByQuantity={product.soldByQuantity}
        statusBadgeProps={statusBadgeProps}
        status={product.status}
        imageUrl={product.primaryImage?.url}
        disabled={headerActionDisabled}
        onPress={headerAction}
      />
    </View>
  );
};
