import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { isLoggedInVar } from "src/apollo/apollo";
import { Button } from "src/components/button";
import { Input } from "src/components/inputs/input";
import { Page } from "src/components/page";
import { Body, Title } from "src/components/texts/text";
import { gql } from "src/gql";
import { UserRoleEnum } from "src/gql/graphql";

const ACCOUNT_QUERY = gql(`
  query AccountQuery {
    me {
      id
      email
      address
      role
    }
  }
`);

const UPDATE_ACCOUNT = gql(`
  mutation UpdateAccount($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      email
      address
    }
  }
  `);

export const Account = () => {
  const [address, setAddress] = useState("");
  const client = useApolloClient();
  const { navigate } = useNavigation();

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
    await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
    isLoggedInVar(false);
  };

  const isAdmin = data?.me.role === UserRoleEnum.Admin;
  return (
    <Page title="Mitt konto" loading={loading}>
      <View>
        <Title size="small">{`Inloggad som ${data?.me.email} ${isAdmin ? "(Administratör)" : ""}`}</Title>
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
        {isAdmin && (
          <Button
            title="Redigera kategorier"
            onPress={() => navigate("EditCategories")}
          />
        )}
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
