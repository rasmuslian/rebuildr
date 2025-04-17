import { LandingQueryQuery } from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Body, Title } from "@components/typography/text";
import { LoginModalContext } from "@context/loginModalContext";
import { useLogout } from "@hooks/useLogout";
import { router } from "expo-router";
import { useContext } from "react";
import { View } from "react-native";

const LANDING_QUERY = gql`
  query LandingQuery {
    me {
      id
      username
      role
    }
  }
`;

const CREATE_DRAFT = gql`
  mutation CreateDraft {
    createDraftProduct {
      id
    }
  }
`;

export default function Landing() {
  const { setVisible } = useContext(LoginModalContext);
  const { logout } = useLogout();

  const { data } = useQuery<LandingQueryQuery>(LANDING_QUERY);
  const [createDraft, { loading: creatingDraft }] = useMutation(CREATE_DRAFT);

  const onCreateNewProduct = () => {
    createDraft({
      onCompleted: () => {
        router.navigate("/(app)/sell-product");
      },
    });
  };

  return (
    <View style={{ alignItems: "center", gap: 16, marginTop: 20 }}>
      <Title>Landningssidan</Title>

      {!data?.me && (
        <Button
          label="Logga in"
          onPress={() => {
            setVisible(true);
          }}
        />
      )}
      {data?.me && (
        <View>
          <Body>Hej {data.me.username}</Body>
          <Button
            label="Logga ut"
            onPress={() => {
              logout();
            }}
          />
          <Button
            label="Skapa annons"
            onPress={() => {
              onCreateNewProduct();
            }}
            loading={creatingDraft}
          />
        </View>
      )}
      <Button
        label="Till testkomponenterna"
        onPress={() => router.navigate("/test-components")}
      />
    </View>
  );
}
