import { AccountPurchasesQuery } from "@/gql/graphql";
import { getProductBadgeProps } from "@/utils/getProductBadgeProps";
import { isPurchaseDone } from "@/utils/purchases/purchases";
import { ProductCard } from "@components/cards/product-card";
import { useScreenType } from "@hooks/useScreenType";
import dayjs from "dayjs";
import { router } from "expo-router";

type Props = {
  purchase: AccountPurchasesQuery["myPurchases"][number];
  onPress?: (purchaseId: string) => void;
  selected?: boolean;
};

export const PurchaseCard = ({ purchase, onPress, selected }: Props) => {
  const product = purchase.product;
  const { isDesktop } = useScreenType();

  const active = isDesktop ? selected : !isPurchaseDone(purchase);
  return (
    <ProductCard
      active={active}
      onPress={() => {
        if (onPress) {
          onPress(purchase.id);
          return;
        }
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
          placeholder: product.seller.type,
          imageUrl: product.seller.profilePicture?.url,
        },
      ]}
      primaryText={product.seller.username ?? ""}
      secondaryText={dayjs(purchase.paymentAcceptedAt).format("D MMMM, YYYY")}
      badgeProps={getProductBadgeProps(
        purchase.product.status,
        "buyer",
        purchase,
      )}
    />
  );
};
