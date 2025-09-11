import { LinkEntry } from "@components/account/link-entry";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Display } from "@components/typography/text";
import { useLogout } from "@hooks/useLogout";
import { View } from "react-native";

export default function Settings() {
  const { logout } = useLogout();

  return (
    <ScreenLayout
      style={{ gap: 24 }}
      headerComponent={<Header title="Kontoinställningar" />}
      footerComponent={
        <Button label="Logga ut" onPress={logout} type="outlined" />
      }
    >
      <Display size="small">Hantera dina uppgifter och inställningar</Display>
      <View style={{ gap: 16 }}>
        <LinkEntry
          label="Utbetalningskonto"
          body="Lägg till eller ändra hur du tar emot betalningar."
          link="/(app)/account/settings/payout"
        />
        <LinkEntry
          label="Kontaktuppgifter"
          body="Uppdatera e-post, användarnamn, lösenord och adresser."
          link="/account/settings/user"
        />
        <LinkEntry
          label="Aviseringar"
          body="Välj vilka aviseringar du vill få via e-post."
          link="/account/settings/notifications"
        />
      </View>
      <Divider />
      <LinkEntry
        label="Radera ditt RebuildRkonto"
        body="Ta bort ditt konto och all tillhörande data."
        link="/account/settings/delete-account"
      />
    </ScreenLayout>
  );
}
