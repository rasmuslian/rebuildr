import { MapPinTypeEnum, User, UserType } from "@/gql/graphql";

export const MapPinProjectType = (user?: Pick<User, "type" | "isFeatured">) => {
  return user?.type === UserType.Business
    ? user.isFeatured
      ? MapPinTypeEnum.Featured
      : MapPinTypeEnum.Hub
    : MapPinTypeEnum.Project;
};
