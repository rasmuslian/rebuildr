import { Body, Headline } from "@components/typography/text";
import { View } from "react-native";
import { Image } from "expo-image";
import Conversation from "@assets/images/conversation.png";

export const ConversationEmptyState = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image source={Conversation.uri} style={{ width: 141, height: 141 }} />
      <Headline style={{ paddingVertical: 24 }} size="small">
        Här var det tomt!
      </Headline>
      <Body size="medium" color="secondary">
        Nya meddelanden dyker upp här när du eller någon annan startar en
        konversation.
      </Body>
    </View>
  );
};
