import { PaymentDeliveryProps } from "@/app/(app)/buy/[productId]/payment";
import {
  SummaryCreateFreePurchaseMutation,
  SummaryCreateFreePurchaseMutationVariables,
  TransportationEnum,
} from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
import { useBuyModalContext } from "@context/buy-modal-context";
import { useScreenType } from "@hooks/useScreenType";
import { router } from "expo-router";

const SUMMARY_CREATE_FREE_PURCHASE = gql`
  mutation SummaryCreateFreePurchase($input: PurchaseProductInput!) {
    purchaseProduct(input: $input) {
      purchase {
        id
        status
      }
    }
  }
`;

export const useSubmitSummary = () => {
  const [purchaseProduct] = useMutation<
    SummaryCreateFreePurchaseMutation,
    SummaryCreateFreePurchaseMutationVariables
  >(SUMMARY_CREATE_FREE_PURCHASE);
  const { isDesktop } = useScreenType();
  const { setContent } = useBuyModalContext();

  const handleFree = (
    productId: string,
    transportationMethod: TransportationEnum,
    delivery?: {
      lat: number;
      lng: number;
      address: string;
    },
  ) => {
    purchaseProduct({
      variables: {
        input: {
          productId,
          transportationMethod,
          deliverToLocation: delivery
            ? {
                lat: delivery.lat,
                lng: delivery.lng,
              }
            : undefined,
          deliverToAddress: delivery?.address,
        },
      },
      onCompleted: (data) => {
        if (isDesktop) {
          setContent({
            buyState: "success",
            purchaseId: data.purchaseProduct.purchase.id,
          });
        } else {
          router.navigate({
            pathname: "/buy/[productId]/success",
            params: { productId, purchaseId: data.purchaseProduct.purchase.id },
          });
        }
      },
    });
  };

  const navigateToPayment = (
    productId: string,
    paymentProps: PaymentDeliveryProps,
  ) => {
    if (isDesktop) {
      setContent({ buyState: "payment", productId, delivery: paymentProps });
    } else {
      router.navigate({
        pathname: "/buy/[productId]/payment",
        params: {
          productId,
          ...paymentProps,
        },
      });
    }
  };

  const submitPickup = (productId: string, price: number) => {
    if (price === 0) {
      return handleFree(productId, TransportationEnum.Pickup);
    }

    navigateToPayment(productId, { transportationMethod: "pickup" });
  };
  const submitShipping = (productId: string, servicePointId: string) => {
    navigateToPayment(productId, {
      transportationMethod: "shipping",
      servicePointId,
    });
  };
  const submitDelivery = (
    productId: string,
    price: number,
    lat: number,
    lng: number,
    address: string,
  ) => {
    if (price === 0) {
      return handleFree(productId, TransportationEnum.Delivery, {
        lat,
        lng,
        address,
      });
    }
    navigateToPayment(productId, {
      transportationMethod: "delivery",
      deliverToLocation: `${lat},${lng}`,
      deliverToAddress: address,
    });
  };

  return {
    submitPickup,
    submitShipping,
    submitDelivery,
  };
};
