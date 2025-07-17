import { AccountPurchasesQuery } from "@/gql/graphql";
import { getProductBadgeProps } from "@/utils/getProductBadgeProps";
import { ProductCard } from "@components/cards/product-card";
import dayjs from "dayjs";
import { router } from "expo-router";

type Props = {
  purchase: AccountPurchasesQuery["myPurchases"][number];
};

export const PurchaseCard = ({ purchase }: Props) => {
  const product = purchase.product;
  return (
    <ProductCard
      active={!purchase.deliveredAt}
      onPress={() => {
        router.navigate({
          pathname: "/account/purchases/[purchaseId]",
          params: { purchaseId: purchase.id },
        });
      }}
      adListProps={{
        title: product.title,
        condition: product.condition,
        quantity: product.primaryQuantity,
        quantityUnit: product.primaryUnit,
        price: product.price,
        imageUrl: product.primaryImage?.url,
        status: product.status,
      }}
      avatars={[
        {
          userType: product.seller.type,
          imageUrl: product.seller.profilePicture?.url,
        },
      ]}
      primaryText={product.seller.username ?? ""}
      secondaryText={dayjs(purchase.paymentAcceptedAt).format("D MMMM, YYYY")}
      badgeProps={getProductBadgeProps(purchase.product.status, purchase)}
    />
  );
};
