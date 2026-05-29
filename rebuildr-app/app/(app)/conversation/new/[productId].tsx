import {
  CreateMessageMutation,
  InitialChatQuery,
  InitialChatQueryVariables,
  Product,
  User,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { ChatActionButtons } from "@components/conversations/chat-action-buttons";
import { ChatHeader } from "@components/conversations/chat-header";
import { MessageInput } from "@components/conversations/message-input";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { useRequireAuth } from "@components/require-auth/require-auth";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

const NEW_CONVERSATION_PRODUCT = gql`
  query initialChat($input: GetProductInput!) {
    product(input: $input) {
      id
      title
      price
      soldByQuantity
      status
      primaryImage {
        id
        url
      }
      seller {
        id
        username
      }
    }
    me {
      id
      type
    }
  }
`;

export default function NewConversation() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const { isLoggedIn, redirect } = useRequireAuth();

  const { data } = useQuery<InitialChatQuery, InitialChatQueryVariables>(
    NEW_CONVERSATION_PRODUCT,
    { variables: { input: { id: productId } }, skip: !isLoggedIn },
  );

  if (redirect) return redirect;

  if (!data) {
    return <LoadingSpinner />;
  }

  const { product, me } = data;

  const onMessageSent = (result: CreateMessageMutation) => {
    router.replace({
      pathname: "/conversation/[conversationId]",
      params: {
        conversationId: result.createMessage.conversationId,
      },
    });
  };

  return (
    <ScreenLayout
      onContentSizeChange="scrollToBottom"
      headerComponent={
        <ChatHeader
          product={data.product as Product}
          otherUser={data.product.seller as User}
          sellerIsMe={false}
        />
      }
      footerBottomMargin="small"
      footerComponent={
        <View style={{ gap: 16 }}>
          <Divider />
          <ChatActionButtons product={product as Product} me={me as User} />
          <MessageInput productId={productId} onMessageSent={onMessageSent} />
        </View>
      }
    >
      <View />
    </ScreenLayout>
  );
}
