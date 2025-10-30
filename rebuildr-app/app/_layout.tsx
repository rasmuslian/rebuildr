import { Slot } from "expo-router";
import {
  ApolloClient,
  ApolloProvider,
  NormalizedCacheObject,
} from "@apollo/client";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useFonts } from "expo-font";
import { ScreenDimensionsProvider } from "@context/screenDimensionsContext";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { Inter_400Regular } from "@expo-google-fonts/inter";
import { initializeApollo } from "@/apollo/config";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LoginModalContext } from "@context/loginModalContext";
import LoginModalView from "@components/modals/loginModalView";
import relativeTime from "dayjs/plugin/relativeTime";
import { HamburgerMenu } from "@components/hamburger/hamburger-menu";
import { SellProductBottomSheet } from "@components/sell-product/sell-product-bottom-sheet";
import { SellProductProdiver } from "@context/sell-product-context";
import { EditProductBottomSheet } from "@components/edit-product/edit-product-bottom-sheet";
import { EditProductProdiver } from "@context/edit-product-context";
import { isIOSDevice } from "@/utils/deviceInfo";
require("dayjs/locale/sv");

dayjs.locale("sv");
dayjs.extend(relativeTime);

const RootLayout = () => {
  const [loaded] = useFonts({
    "Poppins-Regular": Poppins_400Regular,
    "Poppins-Medium": Poppins_500Medium,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
    "Inter-Regular": Inter_400Regular,
  });

  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject>>();
  const [showLoginModal, setShowLoginModal] = useState(false);


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
      {isIOSDevice() && (
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, shrink-to-fit=no"
        />
      )}
      <ApolloProvider client={client}>
        <LoginModalContext.Provider
          value={{
            visible: showLoginModal,
            setVisible: setShowLoginModal,
          }}
        >
          <SellProductProdiver>
            <EditProductProdiver>
              <GestureHandlerRootView>
                <BottomSheetModalProvider>
                  <ScreenDimensionsProvider>
                    <Slot />
                    <HamburgerMenu />
                    <LoginModalView />
                    <SellProductBottomSheet />
                    <EditProductBottomSheet />
                  </ScreenDimensionsProvider>
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </EditProductProdiver>
          </SellProductProdiver>
        </LoginModalContext.Provider>
      </ApolloProvider>
    </>
  );
};

export default RootLayout;
