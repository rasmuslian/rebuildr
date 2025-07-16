import { TransportationEnum } from "@/gql/graphql";

export type TransportationString = "pickup" | "shipping" | "delivery";

export const transportationStringToEnum = (
  transportationString: TransportationString,
) => {
  switch (transportationString) {
    case "pickup":
      return TransportationEnum.Pickup;
    case "shipping":
      return TransportationEnum.Shipping;
    case "delivery":
      return TransportationEnum.Delivery;
  }
};
