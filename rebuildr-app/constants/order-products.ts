import { OrderProductsEnum } from "@/gql/graphql";

export const orderProducts: { [key in OrderProductsEnum]: { text: string } } = {
  [OrderProductsEnum.BestMatch]: {
    text: "Bästa träff",
  },
  [OrderProductsEnum.Distance]: {
    text: "Närmast",
  },
  [OrderProductsEnum.Latest]: {
    text: "Senaste",
  },
  [OrderProductsEnum.Oldest]: {
    text: "Äldsta",
  },
  [OrderProductsEnum.PriceDesc]: {
    text: "Dyrast",
  },
  [OrderProductsEnum.PriceAsc]: {
    text: "Billigast",
  },
};
