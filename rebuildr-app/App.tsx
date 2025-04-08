import "@expo/metro-runtime";
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
import { Helmet } from "react-helmet";

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
    <>
      <Helmet>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
        />
      </Helmet>
      <ApolloProvider client={client}>
        <NavigationContainer linking={linking}>
          <ScreenDimensionsProvider>
            <RootNavigation />
          </ScreenDimensionsProvider>
        </NavigationContainer>
      </ApolloProvider>
    </>
  );
}
