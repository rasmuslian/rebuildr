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
    VerifyMail: "/verifyMail/:email/:token",
    ResetPassword: "/reset-password",
    NewPassword: "/new-password/:email/:token",
  },
};

export const linking = {
  prefixes: [],
  config: config,
};
