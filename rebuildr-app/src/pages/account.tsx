import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { isLoggedInVar } from "src/apollo/apollo";
import { Button } from "src/components/button";
import { Input } from "src/components/inputs/input";
import { Page } from "src/components/page";
import { Body, Title } from "src/components/texts/text";
import { gql } from "src/gql";

const ACCOUNT_QUERY = gql(`
  query AccountQuery {
    me {
      email
      address
    }
  }
`);

const UPDATE_ACCOUNT = gql(`
  mutation UpdateAccount($input: UpdateUserInput!) {
    updateUser(input: $input) {
      email
      address
    }
  }
  `);

export const Account = () => {
  const [address, setAddress] = useState("");
  const client = useApolloClient();

  const { data, loading } = useQuery(ACCOUNT_QUERY);
  const [
    updateAccount,
    { data: updateAccountData, loading: updateAccountLoading },
  ] = useMutation(UPDATE_ACCOUNT);

  const onSave = () => {
    if (updateAccountLoading) {
      return;
    }

    if (!address) {
      return;
    }

    updateAccount({ variables: { input: { address } } });
  };

  const onLogout = async () => {
    await client.clearStore();
    await AsyncStorage.removeItem("access_token");
    isLoggedInVar(false);
  };

  return (
    <Page title="Mitt konto" loading={loading}>
      <View>
        <Title size="small">Inloggad som {data?.me.email}</Title>
        <View style={styles.updateAddressContainer}>
          <Body>Adress</Body>
          <Input
            placeholder={
              updateAccountData?.updateUser.address || data?.me.address
            }
            onChange={setAddress}
            value={address}
            disabled={updateAccountLoading}
          />
          <Button
            title="Spara ändringar"
            onPress={onSave}
            loading={updateAccountLoading}
          />
          {updateAccountData && <Body>Ändringarna sparade!</Body>}
        </View>
        <Button title={"Logga ut"} onPress={onLogout} />
      </View>
    </Page>
  );
};

const styles = StyleSheet.create({
  updateAddressContainer: {
    margin: 10,
    padding: 6,
    borderWidth: 1,
    borderRadius: 20,
    borderColor: "#000",
    borderStyle: "solid",
    gap: 15,
  },
});
