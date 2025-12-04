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
import { SearchDropdown } from "@components/search/search-dropdown";
import { SearchDropdownContextProvider } from "@context/search-dropdown-context";
import * as Sentry from "@sentry/react-native";
import { BuyModalProvider } from "@context/buy-modal-context";
import { BuyModal } from "@components/buy/buy-modal";
import { ReRouteHandler } from "@components/re-route-handler/re-route-handler";
import { PortalHost, PortalProvider } from "@gorhom/portal";
import { LocationProvider } from "@context/location-context";

Sentry.init({
  dsn: "https://e2951ca6a123ca14c24a393620c32c67@o115197.ingest.us.sentry.io/4510306687778816",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});
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
        {process.env.EXPO_PUBLIC_SHOW_COMING_SOON ? (
          <ScreenDimensionsProvider>
            <Slot />
          </ScreenDimensionsProvider>
        ) : (
          <LoginModalContext.Provider
            value={{
              visible: showLoginModal,
              setVisible: setShowLoginModal,
            }}
          >
            <LocationProvider>
              <SellProductProdiver>
                <EditProductProdiver>
                  <GestureHandlerRootView>
                    <PortalProvider>
                      <BottomSheetModalProvider>
                        <ScreenDimensionsProvider>
                          <BuyModalProvider>
                            <SearchDropdownContextProvider>
                              <ReRouteHandler>
                                <Slot />
                                <HamburgerMenu />
                                <LoginModalView />
                                <SellProductBottomSheet />
                                <EditProductBottomSheet />
                                <SearchDropdown />
                                <BuyModal />
                                <PortalHost name="OverlayProvider" />
                              </ReRouteHandler>
                            </SearchDropdownContextProvider>
                          </BuyModalProvider>
                        </ScreenDimensionsProvider>
                      </BottomSheetModalProvider>
                    </PortalProvider>
                  </GestureHandlerRootView>
                </EditProductProdiver>
              </SellProductProdiver>
            </LocationProvider>
          </LoginModalContext.Provider>
        )}
      </ApolloProvider>
    </>
  );
};

export default Sentry.wrap(RootLayout);
