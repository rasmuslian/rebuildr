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
import { TransparentModal } from "@components/transparent-modal.tsx/transparent-modal";
import { Body, Display, Title } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { router } from "expo-router";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

const ACCOUNT_SETTINGS_NOTIFICATIONS = gql`
  query AccountSettingsNotifications {
    me {
      id
      email
      notifyOnMessage
      notifyOnPurchaseUpdate
    }
  }
`;

const ACCOUNT_SETTINGS_UPDATE_NOTIFICATIONS = gql`
  mutation AccountSettingsUpdateNotifications($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        id
        notifyOnMessage
        notifyOnPurchaseUpdate
      }
    }
  }
`;

export default function Notifications() {
  const { isDesktop } = useScreenType();
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
    if (isDesktop) {
      return (
        <TransparentModal>
          <LoadingSpinner />
        </TransparentModal>
      );
    }
    return <LoadingSpinner />;
  }

  const content = (
    <>
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
          title="Meddelanden om köp och försäljning"
          body="Få ett mail när du har köpt något eller när någon har köpt en av dina annonser."
          value={data.me.notifyOnPurchaseUpdate}
          onPress={() => {
            onUpdateNotification({
              id: data.me.id,
              notifyOnPurchaseUpdate: !data.me.notifyOnPurchaseUpdate,
            });
          }}
        />
        <Divider />
      </View>
    </>
  );

  if (isDesktop) {
    return (
      <TransparentModal>
        <ScreenLayout
          contentHorizontalPadding={0}
          headerComponent={<Header title="Aviseringar" />}
          style={{ gap: 24 }}
        >
          {content}
        </ScreenLayout>
      </TransparentModal>
    );
  }

  return (
    <ScreenLayout
      headerComponent={<Header title="Aviseringar" />}
      style={{ gap: 24 }}
    >
      {content}
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
