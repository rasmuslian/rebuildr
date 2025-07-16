import { ShippingProviderEnum } from "@/gql/graphql";

export const shippingProviderStrings: {
  [key in ShippingProviderEnum]: string;
} = {
  [ShippingProviderEnum.Postnord]: "Postnord",
  [ShippingProviderEnum.Dhl]: "DHL",
};
