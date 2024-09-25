import { useQuery } from "@apollo/client";
import { Page } from "src/components/layout/page";
import { Body } from "src/components/texts/text";
import { gql } from "src/gql";
import dayjs from "dayjs";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Section } from "src/components/layout/section";

const CONVERSATIONS_QUERY = gql(`
  query ConversationsQuery {
    conversations {
      otherUser {
        id
        username
      }
      latestMessageAt
      product {
        id
        title
      }
    }
  }
`);

export const Conversations = () => {
  const { navigate } = useNavigation();
  const { data, loading } = useQuery(CONVERSATIONS_QUERY);

  return (
    <Page title="Meddelanden" loading={loading}>
      <Section style={styles.container}>
        <View>
          {data?.conversations
            .map((conversation, i) => (
              <Pressable
                style={styles.conversationCard}
                key={i}
                onPress={() =>
                  navigate("Conversation", {
                    otherUserId: conversation.otherUser.id,
                    productId: conversation.product.id,
                  })
                }
              >
                <Body>Köpare/säljare: {conversation.otherUser.username}</Body>
                <Body>Produkt: {conversation.product.title}</Body>
                <Body>
                  {dayjs(conversation.latestMessageAt).format("DD MMM hh:mm")}
                </Body>
              </Pressable>
            ))
            .reverse()}
        </View>
      </Section>
    </Page>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
    alignItems: "center",
  },
  conversationCard: {
    padding: 8,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 15,
  },
});
