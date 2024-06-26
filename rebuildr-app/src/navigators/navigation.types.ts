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
  ProductDetails: { productId: string };
  Products: {
    searchString?: string;
    address?: string;
    distance?: number;
    categoryId?: string;
  };
  VerifyMail: { email: string; token: string };
  ResetPassword: undefined;
  NewPassword: { email: string; token: string };
};
export type LoggedInStackParamList = {
  Landing: undefined;
  Sell: undefined;
  ProductDetails: { productId: string };
  Conversation: { otherUserId: string; productId: string };
  Conversations: undefined;
  Account: undefined;
  Products: {
    searchString?: string;
    address?: string;
    distance?: number;
    categoryId?: string;
  };
};
