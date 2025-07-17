import {
  ProductStatusEnum,
  PurchaseStatusEnum,
  TransportationEnum,
} from "@/gql/graphql";
import { Badge } from "@components/badges/badge";
import { ComponentProps } from "react";

export const getProductBadgeProps = (
  productStatus: ProductStatusEnum,
  purchase?: {
    status: PurchaseStatusEnum;
    sellerRespondedAt?: Date;
    transportationMethod: TransportationEnum;
  } | null,
): ComponentProps<typeof Badge> | null => {
  if (productStatus === ProductStatusEnum.Deleted) {
    return { text: "Borttagen annons", disabled: true };
  }
  if (productStatus === ProductStatusEnum.Sold) {
    return { text: "Såld annons", disabled: true };
  }

  if (!purchase) {
    return null;
  }

  switch (purchase.status) {
    case PurchaseStatusEnum.Approved:
    case PurchaseStatusEnum.Delivered:
    case PurchaseStatusEnum.FinishedSuccess:
    case PurchaseStatusEnum.PayoutStarted:
    case PurchaseStatusEnum.PayoutFailed:
    case PurchaseStatusEnum.FinishedFailed:
      return {
        text: "Köp slutfört",
      };
    case PurchaseStatusEnum.ShipmentDroppedOff:
    case PurchaseStatusEnum.ShippingStarted:
    case PurchaseStatusEnum.ShippingDelivered:
    case PurchaseStatusEnum.ShipmentBooked:
      return {
        text: "Pågående leverans",
      };
    case PurchaseStatusEnum.PaymentAccepted:
    case PurchaseStatusEnum.PaymentSent:
      if (purchase.transportationMethod === TransportationEnum.Shipping) {
        return { text: "Inväntar inlämning" };
      }
      return {
        text: purchase.sellerRespondedAt
          ? "Inväntar överlämning"
          : "Inväntar svar",
      };
  }

  return null;
};
