import { LandingQueryQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
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

export default function Landing() {
  const { setVisible } = useContext(LoginModalContext);
  const { logout } = useLogout();

  const { data } = useQuery<LandingQueryQuery>(LANDING_QUERY);

  return (
    <View style={{ alignItems: "center", gap: 16, marginTop: 20 }}>
      <Title>Landningssidan</Title>

      <Button
        label="Logga in"
        onPress={() => {
          setVisible(true);
        }}
      />
      {data?.me && (
        <View>
          <Body>Hej {data.me.username}</Body>
          <Button
            label="Logga ut"
            onPress={() => {
              logout();
            }}
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
