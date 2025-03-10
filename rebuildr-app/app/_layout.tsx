import { Slot } from "expo-router";
import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from "@apollo/client";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useFonts } from "expo-font";
import { ScreenDimensionsProvider } from "@context/screenDimensionsContext";
import { Helmet } from "react-helmet";
import React from "react";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { Inter_400Regular } from "@expo-google-fonts/inter";
import { initializeApollo } from "@/apollo/apollo";
require("dayjs/locale/sv");

dayjs.locale("sv");

const RootLayout = () => {
  const [loaded] = useFonts({
    "Poppins-Regular": Poppins_400Regular,
    "Poppins-Medium": Poppins_500Medium,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
    "Inter-Regular": Inter_400Regular,
  });

  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject>>();

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
        ></script>
      </Helmet>
      <ApolloProvider client={client}>
        <ScreenDimensionsProvider>
          <Slot />
        </ScreenDimensionsProvider>
      </ApolloProvider>
    </>
  );
};

export default RootLayout;
