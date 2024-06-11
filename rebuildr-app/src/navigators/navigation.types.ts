declare global {
  namespace ReactNavigation {
    interface RootParamList extends ParamList {}
  }
}

export type ParamList = LandingStackParamList;

export type LandingStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
};
