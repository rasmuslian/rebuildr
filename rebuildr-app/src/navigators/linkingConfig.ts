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
  },
};

export const linking = {
  prefixes: [],
  config: config,
};
