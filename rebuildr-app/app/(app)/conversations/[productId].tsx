import {
  GetConversationsQuery,
  GetConversationsQueryVariables,
  GetConversationsType,
  ProductConversationsQuery,
  ProductConversationsQueryVariables,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { Divider } from "@components/dividers/divider";
import { Button } from "@components/buttons/button";
import { AdList } from "@components/ad/ad-list";
import { ProductConversationsList } from "@components/conversations/product-conversations-list";
import { useScreenType } from "@hooks/useScreenType";
import { ConversationsDesktop } from "@components/conversations/conversations.desktop";
import { GET_CONVERSATIONS } from "@/app/(app)/(tabs)/conversations";

export const PRODUCT_CONVERSATIONS = gql`
  query productConversations($input: GetConversationsInput!) {
    getConversations(input: $input) {
      id
      purchaseId
      buyerReadAt
      sellerReadAt
      buyer {
        id
        username
        type
        profilePicture {
          id
          url
        }
      }
      lastMessage {
        id
        message
        createdAt
        conversationId
        messageType
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
      }
      product {
        id
        title
        status
        primaryQuantity
        primaryUnit
        condition
        price
        soldByQuantity
        primaryImage {
          id
          url
        }
        seller {
          id
          username
          type
          profilePicture {
            id
            url
          }
        }
      }
    }
    me {
      id
    }
  }
`;

export default function ConversationsProduct() {
  const { productId, role } = useLocalSearchParams<{
    productId: string;
    role: "seller" | "buyer";
  }>();
  const { isDesktop } = useScreenType();

  const { data: desktopData, refetch: desktopRefetch } = useQuery<
    GetConversationsQuery,
    GetConversationsQueryVariables
  >(GET_CONVERSATIONS, {
    variables: { input: { type: GetConversationsType.BuyingAndSelling } },
    skip: !isDesktop,
  });

  const { data } = useQuery<
    ProductConversationsQuery,
    ProductConversationsQueryVariables
  >(PRODUCT_CONVERSATIONS, {
    variables: {
      input: {
        productId,
        type: GetConversationsType.BuyingAndSelling,
      },
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (!data || isDesktop) return;
    if (data.getConversations.length === 0) {
      router.replace({
        pathname: "/conversation/new/[productId]",
        params: { productId },
      });
    } else if (data.getConversations.length === 1) {
      router.replace({
        pathname: "/conversation/[conversationId]",
        params: { conversationId: data.getConversations[0].id },
      });
    }
  }, [data, isDesktop]);

  if (isDesktop) {
    if (!desktopData) return <LoadingSpinner />;
    return (
      <ConversationsDesktop
        data={desktopData}
        myId={desktopData.me.id}
        refetch={desktopRefetch}
      />
    );
  }

  if (!data || data.getConversations.length <= 1) {
    return <LoadingSpinner />;
  }

  const product = data.getConversations[0]?.product;

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
              soldByQuantity={product.soldByQuantity}
              quantity={product.primaryQuantity}
              quantityUnit={product.primaryUnit}
              imageUrl={product.primaryImage?.url}
              status={product.status}
            />
            <Button
              label="Gå till annons"
              onPress={() =>
                router.navigate({
                  pathname: "/product/[productId]",
                  params: { productId },
                })
              }
            />
          </View>
        ) : undefined
      }
    >
      <View style={{ gap: 16 }}>
        <ProductConversationsList data={data} />
      </View>
    </ScreenLayout>
  );
}
