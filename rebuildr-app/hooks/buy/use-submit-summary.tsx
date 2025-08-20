import { TransportationEnum } from "@/gql/graphql";
import { gql, useMutation } from "@apollo/client";
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
  const [purchaseProduct] = useMutation(SUMMARY_CREATE_FREE_PURCHASE);

  const handleFree = (
    productId: string,
    transportationMethod: TransportationEnum,
  ) => {
    purchaseProduct({
      variables: {
        input: {
          productId,
          transportationMethod,
        },
      },
      onCompleted: (data) => {
        router.navigate({
          pathname: "/buy/[productId]/success",
          params: { productId, purchaseId: data.purchaseProduct.purchase.id },
        });
      },
    });
  };

  const submitPickup = (productId: string, price: number) => {
    if (price === 0) {
      return handleFree(productId, TransportationEnum.Pickup);
    }

    router.navigate({
      pathname: "/buy/[productId]/payment",
      params: { productId, transportationMethod: "pickup" },
    });
  };
  const submitShipping = (productId: string, servicePointId: string) => {
    router.navigate({
      pathname: "/buy/[productId]/payment",
      params: {
        productId,
        transportationMethod: "shipping",
        servicePointId,
      },
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
      return handleFree(productId, TransportationEnum.Delivery);
    }
    router.navigate({
      pathname: "/buy/[productId]/payment",
      params: {
        productId,
        transportationMethod: "delivery",
        deliverToLocation: `${lat},${lng}`,
        deliverToAddress: address,
      },
    });
  };

  return {
    submitPickup,
    submitShipping,
    submitDelivery,
  };
};
