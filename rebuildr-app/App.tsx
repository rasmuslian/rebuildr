import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from "@apollo/client";
import { Inter_400Regular } from "@expo-google-fonts/inter";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import React, { useEffect, useState } from "react";
import { initializeApollo } from "src/apollo/apollo";
import { ScreenDimensionsProvider } from "src/contexts/screenDimensionsContext";
import { linking } from "src/navigators/linkingConfig";
import { RootNavigation } from "src/navigators/rootNavigation";

export default function App() {
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject>>();
  const [loaded] = useFonts({
    "Poppins-Regular": Poppins_400Regular,
    "Poppins-Medium": Poppins_500Medium,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
    "Inter-Regular": Inter_400Regular,
  });

  useEffect(() => {
    initializeApollo()
      .then((_client) => {
        setClient(_client);
      })
      .catch((e) => console.log("e :>> ", e));
  }, []);

  if (!client || !loaded) {
    return null;
  }

  return (
    <ApolloProvider client={client}>
      <NavigationContainer linking={linking}>
        <ScreenDimensionsProvider>
          <RootNavigation />
        </ScreenDimensionsProvider>
      </NavigationContainer>
    </ApolloProvider>
  );
}
