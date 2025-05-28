import {
  AccountSettingsNotificationsQuery,
  AccountSettingsUpdateNotificationsMutation,
  AccountSettingsUpdateNotificationsMutationVariables,
  UpdateUserInput,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Toggle } from "@components/controls/toggle";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Title } from "@components/typography/text";
import { router } from "expo-router";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

const ACCOUNT_SETTINGS_NOTIFICATIONS = gql`
  query AccountSettingsNotifications {
    me {
      id
      email
      notifyOnMessage
      notifyOnBuy
      notifyOnSale
    }
  }
`;

const ACCOUNT_SETTINGS_UPDATE_NOTIFICATIONS = gql`
  mutation AccountSettingsUpdateNotifications($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        id
        notifyOnMessage
        notifyOnBuy
        notifyOnSale
      }
    }
  }
`;

export default function Notifications() {
  const { data } = useQuery<AccountSettingsNotificationsQuery>(
    ACCOUNT_SETTINGS_NOTIFICATIONS,
  );
  const [updateNotifications, { loading: updateNotificationsLoading }] =
    useMutation<
      AccountSettingsUpdateNotificationsMutation,
      AccountSettingsUpdateNotificationsMutationVariables
    >(ACCOUNT_SETTINGS_UPDATE_NOTIFICATIONS);

  const onUpdateNotification = (input: UpdateUserInput) => {
    if (!data || updateNotificationsLoading) {
      return;
    }

    updateNotifications({ variables: { input } });
  };

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenLayout
      headerComponent={<Header title="Aviseringar" />}
      style={{ gap: 24 }}
    >
      <Display size="small">Välj hur du vill få aviseringar</Display>
      <Body size="medium">
        Alla aviseringar skickas till {data.me.email}. Vill du ändra din
        e-postadress?{" "}
        <Pressable
          onPress={() => router.replace("/(app)/account/settings/user")}
        >
          <Body size="medium" isLink>
            Klicka här
          </Body>
        </Pressable>
        .
      </Body>
      <View style={{ gap: 16, marginTop: 16 }}>
        <Entry
          title="Meddelanden från andra"
          body="Få ett mail när någon skickar ett nytt meddelande till dig."
          value={data.me.notifyOnMessage}
          onPress={() => {
            onUpdateNotification({
              id: data.me.id,
              notifyOnMessage: !data.me.notifyOnMessage,
            });
          }}
        />
        <Divider />
        <Entry
          title="Bekräftelse på köp"
          body="Få en bekräftelse via e-post när ditt köp har gått igenom."
          value={data.me.notifyOnBuy}
          onPress={() => {
            onUpdateNotification({
              id: data.me.id,
              notifyOnBuy: !data.me.notifyOnBuy,
            });
          }}
        />
        <Divider />
        <Entry
          title="När någon köper av dig"
          body="Få ett mail när någon har köpt en av dina annonser."
          value={data.me.notifyOnSale}
          onPress={() => {
            onUpdateNotification({
              id: data.me.id,
              notifyOnSale: !data.me.notifyOnSale,
            });
          }}
        />
      </View>
    </ScreenLayout>
  );
}

type EntryProps = {
  title: string;
  body: string;
  value: boolean;
  onPress: () => void;
};

const Entry = ({ title, body, value, onPress }: EntryProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
      }}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Title size="medium">{title}</Title>
        <Body size="medium" color="secondary">
          {body}
        </Body>
      </View>
      <Toggle onPress={onPress} value={value} />
    </View>
  );
};
