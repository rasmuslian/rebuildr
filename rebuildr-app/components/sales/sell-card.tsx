import { AccountSalesQuery } from "@/gql/graphql";
import { getProductBadgeProps } from "@/utils/getProductBadgeProps";
import { isSaleDone } from "@/utils/sales/sales";
import { ProductCard } from "@components/cards/product-card";
import { useScreenType } from "@hooks/useScreenType";
import dayjs from "dayjs";
import { router } from "expo-router";

type Props = {
  purchase: AccountSalesQuery["myPurchases"][number];
  onPress?: (purchaseId: string) => void;
  selected?: boolean;
};

export const SellCard = ({ purchase, onPress, selected }: Props) => {
  const product = purchase.product;
  const { isDesktop } = useScreenType();
  const active = isDesktop ? selected : !isSaleDone(purchase);
  return (
    <ProductCard
      active={active}
      onPress={() => {
        if (onPress) {
          onPress(purchase.id);
          return;
        }
        router.navigate({
          pathname: "/account/sales/[purchaseId]",
          params: { purchaseId: purchase.id },
        });
      }}
      adListProps={{
        title: product.title,
        condition: product.condition,
        quantity: purchase.purchasedQuantity ?? product.primaryQuantity,
        quantityUnit: product.primaryUnit,
        price: product.price,
        soldByQuantity: product.soldByQuantity,
        imageUrl: product.primaryImage?.url,
        status: product.status,
      }}
      avatars={[
        {
          placeholder: purchase.buyer.type,
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
