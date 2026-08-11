import { SettingsQuery, UserType } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { AccountState } from "@components/account/account-wrapper.desktop";
import { LinkEntry } from "@components/account/link-entry";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Display } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { View } from "react-native";

const SETTINGS_USER_FRAGMENT = gql`
  fragment SettingsUserFragment on User {
    id
    type
  }
`;

export const SETTINGS = gql`
  query Settings {
    me {
      ...SettingsUserFragment
      sellerAccountIsEnabled
    }
  }
  ${SETTINGS_USER_FRAGMENT}
`;

type Props = {
  onBack?: () => void;
  onNavigation?: (state: AccountState) => void;
};

export default function Settings({ onBack, onNavigation }: Props) {
  const { isDesktop } = useScreenType();

  const { data, loading } = useQuery<SettingsQuery>(SETTINGS);

  return (
    <ScreenLayout
      style={{ gap: 24 }}
      contentHorizontalPadding={isDesktop ? 0 : undefined}
      headerComponent={<Header title="Kontoinställningar" onBack={onBack} />}
      loading={loading}
    >
      {loading && (
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
      <LinkEntry
        label="Radera ditt RebuildRkonto"
        body="Ta bort ditt konto och all tillhörande data."
        link={onNavigation ? undefined : "/account/settings/delete-account"}
        onPress={() => onNavigation?.({ page: "delete-account", params: {} })}
      />
    </ScreenLayout>
  );
}
