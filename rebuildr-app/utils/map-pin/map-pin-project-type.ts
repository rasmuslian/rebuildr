import { MapPinTypeEnum, User, UserType } from "@/gql/graphql";

export const MapPinProjectType = (userType?: User["type"]) => {
  return userType === UserType.Business
    ? MapPinTypeEnum.Hub
    : MapPinTypeEnum.Project;
};
