import { PageEnum } from "gql/graphql";

export const getPageContentName = (page: PageEnum) => {
  switch (page) {
    case PageEnum.Partner:
      return "Partners";
    case PageEnum.Contract:
      return "Kontrakt";
    default:
      return "";
  }
};
