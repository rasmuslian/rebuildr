import {
  ConversationsQuery,
  ConversationsQueryVariables,
  GetConversationsType,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { MessageRow } from "@components/messages/message-row";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Divider } from "@components/dividers/divider";
import { Button } from "@components/buttons/button";
import { AdList } from "@components/ad/ad-list";

const CONVERSATIONS = gql`
  query conversations($input: GetConversationsInput!) {
    getConversations(input: $input) {
      id
      message
      readAt
      createdAt
      sender {
        id
        username
        type
        profilePicture {
          id
          url
        }
      }
      receiver {
        id
        username
        type
        profilePicture {
          id
          url
        }
      }
      product {
        id
        title
        primaryQuantity
        primaryUnit
        condition
        price
        primaryImage {
          id
          url
        }
      }
    }
    me {
      id
    }
  }
`;

export default function Conversations() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  //Hämta produkt med alla tillhörande konversationer
  const { data } = useQuery<ConversationsQuery, ConversationsQueryVariables>(
    CONVERSATIONS,
    {
      variables: {
        input: { productId, type: GetConversationsType.Selling },
      },
    },
  );

  if (!data) {
    return <LoadingSpinner />;
  }

  const product = data.getConversations[0].product;

  return (
    <ScreenLayout
      headerComponent={
        <Header title={`${data.getConversations.length} konversationer`} />
      }
      footerBottomMargin="small"
      footerComponent={
        product ? (
          <View style={{ gap: 16 }}>
            <Divider />
            <AdList
              title={product.title}
              condition={product.condition}
              price={product.price}
              quantity={product.primaryQuantity}
              quantityUnit={product.primaryUnit}
              imageUrl={product.primaryImage?.url}
            />
            <Button
              label="Gå till annons"
              onPress={() =>
                router.navigate({ pathname: "/product", params: { productId } })
              }
            />
          </View>
        ) : undefined
      }
    >
      <View style={{ gap: 16 }}>
        {data.getConversations.map((conversation, i) => {
          const otherUser =
            data.me.id === conversation.sender.id
              ? conversation.sender
              : conversation.receiver;
          return (
            <MessageRow
              key={i}
              message={{
                otherUser: {
                  userType: otherUser.type,
                  username: otherUser.username,
                  url: otherUser.profilePicture?.url,
                },
                message: conversation.message,
                createdAt: conversation.createdAt,
                readAt: conversation.readAt,
                productId: product.id,
              }}
            />
          );
        })}
      </View>
    </ScreenLayout>
  );
}
