import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from "@apollo/client";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { initializeApollo } from "src/apollo/apollo";
import { linking } from "src/navigators/linkingConfig";
import { RootNavigation } from "src/navigators/rootNavigation";

export default function App() {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject>>();

  useEffect(() => {
    initializeApollo().then((_client) => {
      setClient(_client);
    });
  }, []);

  if (!client) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <NavigationContainer linking={linking}>
        <RootNavigation />
      </NavigationContainer>
    </ApolloProvider>
  );
}
