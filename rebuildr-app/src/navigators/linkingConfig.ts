const config = {
  screens: {
    Landing: "/",
    Login: "/login",
    Register: "/register",
    Sell: "/sell",
    Buy: "/buy",
    ProductDetails: "/product/:productId",
    Conversations: "/chat",
    Conversation: "/chat/:otherUserId/:productId",
  },
};

export const linking = {
  prefixes: [],
  config: config,
};
