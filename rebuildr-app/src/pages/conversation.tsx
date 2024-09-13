import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "src/components/button";
import { Input } from "src/components/inputs/input";
import { Page } from "src/components/layout/page";
import { Body } from "src/components/texts/text";
import dayjs from "dayjs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LoggedInStackParamList } from "src/navigators/navigation.types";
import { gql } from "src/gql";
import { useMutation, useQuery } from "@apollo/client";

const CONVERSATION_QUERY = gql(`
  query ConversationQuery($input: ConversationInput!) {
    conversation(input: $input) {
      otherUser {
        id
        email
      }
      messages {
        id
        receiverId
        createdAt
        body
      }
    }
  }
`);

const SEND_MESSAGE = gql(`
mutation SendMessage($input: CreateMessageInput!) {
  createMessage(input: $input) {
    createdAt
    body  
  }
}
`);

export const Conversation = ({
  route,
}: NativeStackScreenProps<LoggedInStackParamList, "Conversation">) => {
  const [message, setMessage] = useState("");

  const { otherUserId, productId } = route.params;

  const { data, loading: loadingConversation } = useQuery(CONVERSATION_QUERY, {
    variables: { input: { productId, otherUserId } },
    skip: !otherUserId || !productId,
  });
  const [sendMessage, { loading: sendingMessage }] = useMutation(SEND_MESSAGE);

  const onSend = () => {
    if (!message || sendingMessage) {
      return;
    }
    sendMessage({
      variables: {
        input: {
          receiverId: otherUserId,
          productId: productId,
          body: message,
        },
      },
      refetchQueries: [CONVERSATION_QUERY],
    });
    setMessage("");
  };

  return (
    <Page
      title={`Konversation med ${data?.conversation.otherUser.email}`}
      loading={loadingConversation}
    >
      <View style={styles.container}>
        <View>
          <View style={styles.chatContainer}>
            {data?.conversation.messages.map((message) => (
              <View style={styles.messageContainer} key={message.id}>
                <Body style={styles.date}>
                  {dayjs(message.createdAt).format("DD MM hh:mm")}
                </Body>
                <View
                  style={[
                    styles.chatBubble,
                    {
                      alignSelf:
                        message.receiverId === otherUserId
                          ? "flex-end"
                          : "flex-start",
                    },
                  ]}
                >
                  <Body style={styles.message}>{message.body}</Body>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.inputContainer}>
            <Input
              value={message}
              onChange={setMessage}
              placeholder={"Skriv..."}
              onSubmitEditing={onSend}
            />
            <Button onPress={onSend} icon="Person" />
          </View>
        </View>
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 50,
  },
  chatContainer: {
    gap: 10,
  },
  messageContainer: {},
  date: {
    alignSelf: "center",
    marginBottom: 6,
  },
  chatBubble: {
    backgroundColor: "#AAA",
    borderRadius: 20,
  },
  message: {
    marginVertical: 6,
    marginHorizontal: 10,
  },
  inputContainer: {
    marginTop: 10,
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 2,
    borderStyle: "solid",
    borderColor: "#000",
    justifyContent: "space-between",
    gap: 6,
  },
});
