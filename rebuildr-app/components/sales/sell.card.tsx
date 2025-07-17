import { AccountSalesQuery } from "@/gql/graphql";
import { getProductBadgeProps } from "@/utils/getProductBadgeProps";
import { ProductCard } from "@components/cards/product-card";
import dayjs from "dayjs";
import { router } from "expo-router";

type Props = {
  purchase: AccountSalesQuery["myPurchases"][number];
};

export const SellCard = ({ purchase }: Props) => {
  const product = purchase.product;
  return (
    <ProductCard
      active={!purchase.deliveredAt}
      onPress={() => {
        router.navigate({
          pathname: "/account/sales/[purchaseId]",
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
          userType: purchase.buyer.type,
          imageUrl: purchase.buyer.profilePicture?.url,
        },
      ]}
      primaryText={purchase.buyer.username ?? ""}
      secondaryText={dayjs(purchase.paymentAcceptedAt).format("D MMMM, YYYY")}
      badgeProps={getProductBadgeProps(
        purchase.product.status,
        "seller",
        purchase,
      )}
    />
  );
};
