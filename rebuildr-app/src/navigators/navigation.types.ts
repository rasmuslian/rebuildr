declare global {
  namespace ReactNavigation {
    interface RootParamList extends ParamList {}
  }
}

export type ParamList = LandingStackParamList & LoggedInStackParamList;

export type LandingStackParamList = {
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  Sell: undefined;
  Buy: undefined;
};
export type LoggedInStackParamList = {
  Landing: undefined;
  Sell: undefined;
  Buy: undefined;
};
