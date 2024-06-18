import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Button } from "src/components/button";
import { Page } from "src/components/page";

export const Landing = () => {
  const { navigate } = useNavigation();

  return (
    <Page title="Landing">
      <Button title="Köp" onPress={() => navigate("Buy")} />
    </Page>
  );
};
