import { PaymentMethod } from "@/gql/graphql";

export const paymentMethodStrings: { [key in PaymentMethod]: string } = {
  [PaymentMethod.Swish]: "Swish",
  [PaymentMethod.Card]: "Kort",
};
