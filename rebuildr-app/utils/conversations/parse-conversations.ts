import { GetConversationsQuery } from "@/gql/graphql";

export const parseConversations = (
  data: GetConversationsQuery,
  tab: "sell" | "buy",
) => {
  const totalUnread = data.getConversations.reduce(
    (acc, curr) =>
      acc + (curr.sender.id !== data.me.id && !curr.readAt ? 1 : 0),
    0,
  );
  const buyConversations = data.getConversations.filter(
    (convo) => convo.product.seller.id !== data.me.id,
  );
  const nrUnreadBuy = buyConversations.reduce(
    (acc, curr) =>
      acc + (curr.sender.id !== data.me.id && !curr.readAt ? 1 : 0),
    0,
  );
  const sellConversations = data.getConversations.filter(
    (convo) => convo.product.seller.id === data.me.id,
  );
  const nrUnreadSell = sellConversations.reduce(
    (acc, curr) =>
      acc + (curr.sender.id !== data.me.id && !curr.readAt ? 1 : 0),
    0,
  );
  const conversations = tab === "buy" ? buyConversations : sellConversations;
  const conversationsPerProduct = conversations.reduce(
    (
      acc: {
        productId: string;
        conversations: GetConversationsQuery["getConversations"];
      }[],
      curr,
    ) => {
      const existingIndex = acc.findIndex(
        (group) => group.productId === curr.product.id,
      );
      if (existingIndex !== -1) {
        //Return a new array with an updated 'conversastions' field on the existing
        //index where 'productId' matched
        return acc.toSpliced(existingIndex, 1, {
          productId: acc[existingIndex].productId,
          conversations: [...acc[existingIndex].conversations, curr],
        });
      }
      return [...acc, { productId: curr.product.id, conversations: [curr] }];
    },
    [],
  );
  const unread = conversationsPerProduct.filter((group) =>
    group.conversations.some((convo) => {
      return convo.sender.id !== data.me.id && !convo.readAt;
    }),
  );
  const read = conversationsPerProduct.filter((group) =>
    group.conversations.every(
      (convo) => convo.sender.id === data.me.id || !!convo.readAt,
    ),
  );

  return {
    totalUnread,
    nrUnreadBuy,
    nrUnreadSell,
    unread,
    read,
    all: conversationsPerProduct,
  };
};
