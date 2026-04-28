import { GetConversationsQuery } from "@/gql/graphql";

export type ConversationsPerProductType = {
  productId: string;
  conversations: GetConversationsQuery["getConversations"];
}[];
export const parseConversations = (
  data: GetConversationsQuery,
  tab: "sell" | "buy",
) => {
  const buyConversations = data.getConversations.filter(
    (convo) => convo.buyerId === data.me.id,
  );
  const nrUnreadBuy = buyConversations.filter(
    (c) =>
      c.lastMessage?.sender?.id !== data.me.id &&
      c.lastMessage?.createdAt &&
      (!c.buyerReadAt ||
        new Date(c.lastMessage.createdAt) > new Date(c.buyerReadAt)),
  ).length;

  const sellConversations = data.getConversations.filter(
    (convo) => convo.product.sellerId === data.me.id,
  );
  const nrUnreadSell = sellConversations.filter(
    (c) =>
      c.lastMessage?.sender?.id !== data.me.id &&
      c.lastMessage?.createdAt &&
      (!c.sellerReadAt ||
        new Date(c.lastMessage.createdAt) > new Date(c.sellerReadAt)),
  ).length;
  const totalUnread = nrUnreadBuy + nrUnreadSell;

  const conversations = tab === "buy" ? buyConversations : sellConversations;
  const conversationsPerProduct = conversations.reduce(
    (acc: ConversationsPerProductType, curr) => {
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
  const isUnread = (
    convo: GetConversationsQuery["getConversations"][number],
  ) => {
    if (
      !convo.lastMessage?.createdAt ||
      convo.lastMessage.sender?.id === data.me.id
    )
      return false;
    const lastAt = new Date(convo.lastMessage.createdAt);
    const readAt = tab === "buy" ? convo.buyerReadAt : convo.sellerReadAt;
    return !readAt || lastAt > new Date(readAt);
  };

  const unread = conversationsPerProduct.filter((group) =>
    group.conversations.some(isUnread),
  );
  const read = conversationsPerProduct.filter((group) =>
    group.conversations.every((convo) => !isUnread(convo)),
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
