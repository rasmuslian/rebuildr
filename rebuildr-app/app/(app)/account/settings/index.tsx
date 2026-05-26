import {
  SettingsQuery,
  SettingsUserFragmentFragment,
  SwitchAccountMutation,
  SwitchAccountMutationVariables,
  UserType,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { AccountState } from "@components/account/account-wrapper.desktop";
import { LinkEntry } from "@components/account/link-entry";
import { Avatar } from "@components/avatar/avatar";
import { Badge } from "@components/badges/badge";
import { Radio } from "@components/controls/radio";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Display, Headline, Label } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

const SETTINGS_USER_FRAGMENT = gql`
  fragment SettingsUserFragment on User {
    id
    username
    type
    numberOfPublishedProducts
    numberOfSoldProducts
    profilePicture {
      id
      url
    }
  }
`;

export const SETTINGS = gql`
  query Settings {
    me {
      ...SettingsUserFragment
      sellerAccountIsEnabled
      organizationAccount {
        ...SettingsUserFragment
      }
      organizationOwner {
        ...SettingsUserFragment
      }
    }
  }
  ${SETTINGS_USER_FRAGMENT}
`;

const SWITCH_ACCOUNT_MUTATION = gql`
  mutation SwitchAccount($id: String!) {
    switchAccount(id: $id) {
      user {
        ...SettingsUserFragment
      }
      refreshToken
      accessToken
    }
  }
  ${SETTINGS_USER_FRAGMENT}
`;

type Props = {
  onBack?: () => void;
  onNavigation?: (state: AccountState) => void;
};

export default function Settings({ onBack, onNavigation }: Props) {
  const [isSwitching, setIsSwitching] = useState(false);
  const { isDesktop } = useScreenType();

  const { data, loading, refetch } = useQuery<SettingsQuery>(SETTINGS);

  const [switchAccount, { client, data: switchAccountData }] = useMutation<
    SwitchAccountMutation,
    SwitchAccountMutationVariables
  >(SWITCH_ACCOUNT_MUTATION);

  const onSwitchAccount = (accountId: string) => {
    setIsSwitching(true);
    switchAccount({ variables: { id: accountId } });
  };

  useEffect(() => {
    if (switchAccountData) {
      const postSwitch = async () => {
        try {
          await AsyncStorage.multiSet([
            ["access_token", switchAccountData.switchAccount.accessToken],
            ["refresh_token", switchAccountData.switchAccount.refreshToken],
          ]);

          await client.resetStore();
          refetch();
        } catch (e) {
          console.error(e);
        } finally {
          setIsSwitching(false);
        }
      };
      postSwitch();
    }
  }, [switchAccountData]);

  return (
    <ScreenLayout
      style={{ gap: 24 }}
      contentHorizontalPadding={isDesktop ? 0 : undefined}
      headerComponent={<Header title="Kontoinställningar" onBack={onBack} />}
      loading={loading}
    >
      {(loading || isSwitching) && (
        <LoadingSpinner
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
        />
      )}
      <Display size="small">Hantera dina uppgifter och inställningar</Display>
      {(data?.me.organizationAccount || data?.me.organizationOwner) && (
        <>
          <View style={{ gap: 16 }}>
            <Headline size="small">Byt konto</Headline>
            {data?.me.organizationOwner && (
              <UserRow
                user={data.me.organizationOwner}
                onPress={onSwitchAccount}
              />
            )}
            <UserRow user={data.me} selected />
            {data?.me.organizationAccount && (
              <UserRow
                user={data.me.organizationAccount}
                onPress={onSwitchAccount}
              />
            )}
          </View>
          <Divider />
        </>
      )}
      <View style={{ gap: 16 }}>
        <LinkEntry
          label="Utbetalningskonto"
          body="Lägg till eller ändra hur du tar emot betalningar."
          link={onNavigation ? undefined : "/account/settings/payout"}
          onPress={() => onNavigation?.({ page: "payout-index", params: {} })}
        />
        <LinkEntry
          label="Kontaktuppgifter"
          body="Uppdatera e-post, användarnamn, lösenord och adresser."
          link={onNavigation ? undefined : "/account/settings/user"}
          onPress={() => onNavigation?.({ page: "user", params: {} })}
        />
        {data?.me.type === UserType.Personal && (
          <LinkEntry
            label="Aviseringar"
            body="Välj vilka aviseringar du vill få via e-post."
            link={onNavigation ? undefined : "/account/settings/notifications"}
            onPress={() =>
              onNavigation?.({ page: "notifications", params: {} })
            }
          />
        )}
      </View>
      <Divider />
      {data?.me.type === UserType.Personal && !data.me.organizationAccount && (
        <>
          <LinkEntry
            label="Lägg till ett företagskonto"
            body="Perfekt! Vi hjälper dig att komma igång med företagskontot, enkelt och smidigt!"
            link={onNavigation ? undefined : "/account/settings/add-business"}
            onPress={() => onNavigation?.({ page: "business-add", params: {} })}
          />
          <Divider />
        </>
      )}
      <LinkEntry
        label="Radera ditt RebuildRkonto"
        body="Ta bort ditt konto och all tillhörande data."
        link={onNavigation ? undefined : "/account/settings/delete-account"}
        onPress={() => onNavigation?.({ page: "delete-account", params: {} })}
      />
    </ScreenLayout>
  );
}

type UserRowProps = {
  user: SettingsUserFragmentFragment;
  selected?: boolean;
  onPress?: (userId: string) => void;
};
const UserRow = ({ user, selected, onPress }: UserRowProps) => {
  const isBusiness = user.type === UserType.Business;

  return (
    <Pressable
      disabled={selected || !onPress}
      onPress={() => onPress?.(user.id)}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
      }}
    >
      <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
        <Avatar
          placeholder={user.type}
          imageUrl={user.profilePicture?.url}
          size="small"
        />
        <View style={{ gap: 2 }}>
          <Label size="large">{user.username}</Label>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 2,
            }}
          >
            {isBusiness && (
              <View>
                <Badge size="medium" text="Företag" />
              </View>
            )}
            <Body size="small">
              {user.numberOfPublishedProducts} annonser •{" "}
              {user.numberOfSoldProducts} sålda
            </Body>
          </View>
        </View>
      </View>
      <View pointerEvents="none">
        <Radio selected={selected} />
      </View>
    </Pressable>
  );
};
