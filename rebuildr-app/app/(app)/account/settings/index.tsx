import { LinkEntry } from "@components/account/link-entry";
import { Button } from "@components/buttons/button";
import { Divider } from "@components/dividers/divider";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Display } from "@components/typography/text";
import { useLogout } from "@hooks/useLogout";
import { router } from "expo-router";
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
          onPress={() => {
            router.navigate("/(app)/account/settings/payout");
          }}
        />
        <LinkEntry
          label="Kontaktuppgifter"
          body="Uppdatera e-post, användarnamn, lösenord och adresser."
          onPress={() => {
            router.navigate("/account/settings/user");
          }}
        />
        <LinkEntry
          label="Aviseringar"
          body="Välj vilka aviseringar du vill få via e-post."
          onPress={() => {
            router.navigate("/account/settings/notifications");
          }}
        />
      </View>
      <Divider />
      <LinkEntry
        label="Radera ditt RebuildRkonto"
        body="Ta bort ditt konto och all tillhörande data."
        onPress={() => {
          router.navigate("/account/settings/delete-account");
        }}
      />
    </ScreenLayout>
  );
}
