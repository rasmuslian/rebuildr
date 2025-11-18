import { Button } from "@components/buttons/button";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { View } from "react-native";
import Warning from "@assets/images/warning.png";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Link, router } from "expo-router";
import { Image } from "expo-image";
import { Body, Display } from "@components/typography/text";
import { useLogout } from "@hooks/useLogout";
import { Divider } from "@components/dividers/divider";
import { DeleteAccountMeQuery, UserType } from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";

const DELETE_ACCOUNT_ME = gql`
  query DeleteAccountMe {
    me {
      id
      type
    }
  }
`;

const DELETE_ACCOUNT = gql`
  mutation DeleteAccount {
    deleteAccount {
      id
    }
  }
`;

type Props = {
  onBack?: () => void;
  onClose?: () => void;
};

export default function DeleteAccount({ onBack, onClose }: Props) {
  const { data, loading } = useQuery<DeleteAccountMeQuery>(DELETE_ACCOUNT_ME);
  const [deleteAccount, { loading: deleteAccountLoading, error }] =
    useMutation(DELETE_ACCOUNT);
  const { logout } = useLogout();
  const { isDesktop } = useScreenType();

  return (
    <ScreenLayout
      style={{ gap: 24 }}
      loading={loading}
      contentHorizontalPadding={isDesktop ? 0 : undefined}
      headerComponent={
        <Header title="Radera ditt RebuildRkonto" onBack={onBack} />
      }
      footerComponent={
        <View style={{ gap: 8 }}>
          {error && (
            <Body size="small" color="error">
              Något gick fel vid radering av kontot. Om du har pågående affärer
              så kan du inte radera ditt konto.
            </Body>
          )}
          <Button
            label="Radera konto"
            onPress={() => {
              deleteAccount({
                onCompleted: () => {
                  logout();
                  onClose?.();
                },
              });
            }}
            type="danger"
            loading={deleteAccountLoading}
          />
          <Button
            label="Avbryt"
            onPress={() => {
              if (onBack) {
                onBack();
              } else if (router.canGoBack()) {
                router.back();
              } else {
                router.navigate("/account/settings");
              }
            }}
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
        {`Vill du radera ditt ${data?.me.type === UserType.Business ? "företagskonto" : "konto"}?`}
      </Display>
      <Body size="medium" style={{ textAlign: "center" }}>
        Att radera ditt konto innebär att all din data tas bort permanent och
        kan inte återställas. Dina aktiva annonser kommer att raderas och du
        kommer inte längre kunna logga in.
      </Body>
      {data?.me.type === UserType.Personal && (
        <>
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
        </>
      )}
    </ScreenLayout>
  );
}
