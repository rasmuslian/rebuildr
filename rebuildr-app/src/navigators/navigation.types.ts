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
  ProductDetails: { productId: string };
};
export type LoggedInStackParamList = {
  Landing: undefined;
  Sell: undefined;
  Buy: undefined;
  ProductDetails: { productId: string };
  Conversation: { otherUserId: string; productId: string };
  Conversations: undefined;
  Account: undefined;
};
