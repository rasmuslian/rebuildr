import { Button } from "@components/buttons/button";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { View } from "react-native";
import Warning from "@assets/images/warning.png";
import { gql, useMutation } from "@apollo/client";
import { Link, router } from "expo-router";
import { Image } from "expo-image";
import { Body, Display } from "@components/typography/text";
import { useLogout } from "@hooks/useLogout";
import { Divider } from "@components/dividers/divider";

const DELETE_ACCOUNT = gql`
  mutation DeleteAccount {
    deleteAccount {
      id
    }
  }
`;

export default function DeleteAccount() {
  const [deleteAccount, { loading }] = useMutation(DELETE_ACCOUNT);
  const { logout } = useLogout();

  return (
    <ScreenLayout
      style={{ gap: 24 }}
      headerComponent={<Header title="Radera ditt RebuildRkonto" />}
      footerComponent={
        <View style={{ gap: 8 }}>
          <Button
            label="Radera konto"
            onPress={() => {
              deleteAccount({
                onCompleted: () => {
                  logout();
                },
              });
            }}
            type="danger"
            loading={loading}
          />
          <Button
            label="Avbryt"
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.navigate("/account/settings")
            }
            type="outlined"
          />
        </View>
      }
    >
      <View
        style={{ padding: 24, justifyContent: "center", alignItems: "center" }}
      >
        <Image source={Warning.uri} style={{ width: 141, height: 141 }} />
      </View>
      <Display size="small" style={{ textAlign: "center" }}>
        Vill du radera ditt konto?
      </Display>
      <Body size="medium" style={{ textAlign: "center" }}>
        Att radera ditt konto innebär att all din data tas bort permanent och
        kan inte återställas. Dina aktiva annonser kommer att raderas och du
        kommer inte längre kunna logga in.
      </Body>
      <Divider />
      <View>
        <Body size="medium">
          Om du bara vill ändra din e-post eller sluta få aviseringar kan du
          göra det i dina{" "}
          <Link href="/account/settings" replace>
            <Body size="medium" isLink>
              kontoinställningar.
            </Body>
          </Link>
        </Body>
      </View>
    </ScreenLayout>
  );
}
