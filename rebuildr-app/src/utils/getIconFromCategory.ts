import { IconType } from "src/components/icons-old/icon";
import { CategoryIconEnum } from "src/gql/graphql";

export const getIconFromCategory = (
  categoryIcon: CategoryIconEnum,
): IconType => {
  switch (categoryIcon) {
    case CategoryIconEnum.Material:
      return "Material";
    case CategoryIconEnum.Wood:
      return "Wood";
    case CategoryIconEnum.Door:
      return "Door";
    case CategoryIconEnum.Window:
      return "Window";
    case CategoryIconEnum.Floor:
      return "Floor";
    case CategoryIconEnum.Interior:
      return "Interior";
    case CategoryIconEnum.Paint:
      return "Paint";
    case CategoryIconEnum.Fasteners:
      return "Fasteners";
    case CategoryIconEnum.Roof:
      return "Roof";
    case CategoryIconEnum.Tiles:
      return "Tiles";
    case CategoryIconEnum.KitchenBathroom:
      return "Bathtub";
    case CategoryIconEnum.Electrical:
      return "Outlet";
    case CategoryIconEnum.Outdoors:
      return "Tree";
    case CategoryIconEnum.Tools:
      return "Drill";
    case CategoryIconEnum.Workplace:
      return "Wheelbarrow";
    default:
      return "Material";
  }
};
