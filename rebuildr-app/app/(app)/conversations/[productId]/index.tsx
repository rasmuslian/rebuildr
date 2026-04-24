import {
  ConversationsQuery,
  ConversationsQueryVariables,
  GetConversationsType,
} from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Divider } from "@components/dividers/divider";
import { Button } from "@components/buttons/button";
import { AdList } from "@components/ad/ad-list";
import { ProductConversationsList } from "@components/conversations/product-conversations-list";

export const CONVERSATIONS = gql`
  query conversations($input: GetConversationsInput!) {
    getConversations(input: $input) {
      id
      message
      readAt
      createdAt
      purchaseId
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
  const { data } = useQuery<ConversationsQuery, ConversationsQueryVariables>(
    CONVERSATIONS,
    {
      variables: {
        input: {
          productId,
          type:
            role === "seller"
              ? GetConversationsType.Selling
              : GetConversationsType.Buying,
        },
      },
    },
  );

  if (!data) {
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
