import { ApolloProvider } from "@apollo/client";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import { client } from "src/apollo/apollo";
import { linking } from "src/navigators/linkingConfig";
import { RootNavigation } from "src/navigators/rootNavigation";

export default function App() {
  return (
    <ApolloProvider client={client}>
      <NavigationContainer linking={linking}>
        <RootNavigation />
      </NavigationContainer>
    </ApolloProvider>
  );
}
