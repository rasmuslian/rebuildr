import {
  ProductStatusEnum,
  PurchaseStatusEnum,
  TransportationEnum,
} from "@/gql/graphql";
import { router } from "expo-router";
import { useCallback } from "react";

type Props = {
  productId: string;
  productStatus?: ProductStatusEnum;
  role: "seller" | "buyer";
  purchase?: {
    id: string;
    status: PurchaseStatusEnum;
    sellerRespondedAt?: Date;
    transportationMethod: TransportationEnum;
  } | null;
};

export const useChatHeaderNavigation = ({
  productId,
  productStatus,
  role,
  purchase,
}: Props) => {
  return {
    disabled: productStatus === ProductStatusEnum.Deleted,
    action: useCallback(() => {
      if (productStatus === ProductStatusEnum.Deleted) {
        return null;
      }
      if (!purchase) {
        router.navigate({
          pathname: "/product/[productId]",
          params: { productId },
        });
      }

      if (purchase) {
        if (role === "seller") {
          router.navigate({
            pathname: "/account/sales/[purchaseId]",
            params: { purchaseId: purchase.id },
          });
        } else {
          router.navigate({
            pathname: "/account/purchases/[purchaseId]",
            params: { purchaseId: purchase.id },
          });
        }
      }
    }, [productId, purchase, productStatus]),
  };
};
