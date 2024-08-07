const config = {
  screens: {
    Landing: "/",
    Login: "/login",
    Register: "/register",
    Sell: "/sell",
    ProductDetails: "/product/:productId",
    Conversations: "/chat",
    Conversation: "/chat/:otherUserId/:productId",
    Account: "/account",
    Products: "/products/",
    VerifyMail: "/verify-email",
    ResetPassword: "/reset-password",
    NewPassword: "/new-password",
  },
};

export const linking = {
  prefixes: [],
  config: config,
};
