import { MapPinTypeEnum } from "@/gql/graphql";
import ProductDark from "@assets/svgs/product-marker-dark.svg";
import ProductLight from "@assets/svgs/product-marker-light.svg";
import ProjectDark from "@assets/svgs/project-marker-dark.svg";
import ProjectLight from "@assets/svgs/project-marker-light.svg";

export const getMarkerSvg = (type: MapPinTypeEnum, selected: boolean) => {
  switch (type) {
    case MapPinTypeEnum.Product:
      return selected ? ProductDark : ProductLight;
    case MapPinTypeEnum.Project:
      return selected ? ProjectDark : ProjectLight;
  }

  return "";
};
