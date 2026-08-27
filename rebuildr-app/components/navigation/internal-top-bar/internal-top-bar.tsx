import { InternalAdsMenuContextQuery } from "@/gql/graphql";
import { INTERNAL_ADS_MENU_CONTEXT } from "@/queries/internal-ads";
import { useQuery } from "@apollo/client";
import AterbankenLogotype from "@assets/images/aterbanken-logotype.png";
import { Button } from "@components/buttons/button";
import { SearchBar } from "@components/search/search-bar";
import { Label } from "@components/typography/text";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { primitives } from "@constants/colors";
import { isWeb, MAX_CONTENT_WIDTH, WEB_STICKY } from "@constants/layout";
import { horizontalPadding } from "@constants/sizes";
import { LoginModalContext } from "@context/loginModalContext";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { useUser } from "@hooks/useUser";
import { Icon } from "@icons/icon";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useContext, useState } from "react";
import { Pressable, View } from "react-native";

import { useSearchContext } from "@context/search-context";

type Props = {
  home?: boolean;
  showActions?: boolean;
  showSearchBar?: boolean;
  onCreateAd?: () => void;
};

export const InternalTopBar = ({
  home = false,
  showActions = true,
  showSearchBar = true,
  onCreateAd,
}: Props) => {
  const { isDesktop } = useScreenType();
  const { data } = useQuery<InternalAdsMenuContextQuery>(
    INTERNAL_ADS_MENU_CONTEXT,
    { fetchPolicy: "cache-and-network" },
  );
  const canUseInternalAds =
    showActions && !!data?.internalAdsOrganizationContext;

  return (
    <View
      style={isWeb ? { position: WEB_STICKY, top: 0, zIndex: 100 } : undefined}
    >
      {isDesktop ? (
        <InternalTopBarDesktop
          home={home}
          showActions={canUseInternalAds}
          showSearchBar={showSearchBar}
          onCreateAd={onCreateAd}
        />
      ) : (
        <InternalTopBarMobile
          home={home}
          showActions={canUseInternalAds}
          onCreateAd={onCreateAd}
        />
      )}
    </View>
  );
};

const useInternalNavigation = () => {
  const { filterBuilder } = useFilterProduct();
  const searchContext = useSearchContext();

  const goInternalHome = () => {
    filterBuilder.reset().apply();
    searchContext.reset();
    router.navigate("/internal");
  };

  const goMarketplace = () => {
    filterBuilder.reset().apply();
    searchContext.reset();
    router.navigate("/");
  };

  return { goInternalHome, goMarketplace };
};

const useCreateInternalAd = (onCreateAd?: () => void) => {
  const { isLoggedIn } = useUser();
  const { setVisible: setLoginVisible } = useContext(LoginModalContext);

  return () => {
    if (!isLoggedIn) {
      setLoginVisible(true);
      return;
    }

    if (onCreateAd) {
      onCreateAd();
      return;
    }

    router.navigate({
      pathname: "/internal",
      params: { action: "create", t: Date.now().toString() },
    });
  };
};

const InternalTopBarDesktop = ({
  home,
  showActions,
  showSearchBar,
  onCreateAd,
}: Props) => {
  const colors = useThemeColor();
  const [menuOpen, setMenuOpen] = useState(false);
  const { goInternalHome, goMarketplace } = useInternalNavigation();
  const createInternalAd = useCreateInternalAd(onCreateAd);

  return (
    <>
      <View
        style={{
          backgroundColor: colors.background.neutral,
          borderBottomColor: colors.dividers.neutral,
          borderBottomWidth: home ? 0 : 1,
          height: 64,
          width: "100%",
        }}
      >
        <View
          style={{
            alignItems: "center",
            alignSelf: "center",
            flexDirection: "row",
            height: "100%",
            justifyContent: "space-between",
            maxWidth: MAX_CONTENT_WIDTH,
            paddingHorizontal: horizontalPadding.desktop,
            width: "100%",
          }}
        >
          <View style={{ alignItems: "center", flexDirection: "row", gap: 20 }}>
            <Pressable accessibilityRole="link" onPress={goInternalHome}>
              <Image
                source={AterbankenLogotype}
                contentFit="contain"
                style={{ width: 145, height: 25 }}
              />
            </Pressable>
            {showActions && showSearchBar && (
              <SearchBar
                backgroundColor="transparent"
                searchOnSubmit
                searchScope="internal"
                placeholder="Vad letar du efter?"
                style={{ borderBottomWidth: 0, width: 360 }}
                borderStyle={{
                  borderColor: colors.dividers.neutral,
                  borderWidth: 1,
                }}
              />
            )}
          </View>
          <View style={{ alignItems: "center", flexDirection: "row", gap: 12 }}>
            <Button
              label="Meny"
              icon="hamburger"
              type="outlined"
              theme="light"
              onPress={() => setMenuOpen(true)}
              style={{ backgroundColor: primitives.neutrals100 }}
            />
            {showActions && (
              <Button label="Ny annons" onPress={createInternalAd} />
            )}
          </View>
        </View>
      </View>
      <InternalMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onGoMarketplace={goMarketplace}
        showInternalLinks={!!showActions}
        showMemberManagement={!!showActions}
      />
    </>
  );
};

const InternalTopBarMobile = ({ home, showActions }: Props) => {
  const colors = useThemeColor();
  const [menuOpen, setMenuOpen] = useState(false);
  const { goInternalHome, goMarketplace } = useInternalNavigation();

  return (
    <>
      <View
        style={{
          backgroundColor: colors.background.neutral,
          borderBottomColor: colors.dividers.neutral,
          borderBottomWidth: home ? 0 : 1,
        }}
      >
        <View
          style={{
            alignItems: "center",
            alignSelf: "center",
            flexDirection: "row",
            height: 56,
            justifyContent: "space-between",
            maxWidth: MAX_CONTENT_WIDTH,
            paddingHorizontal: horizontalPadding.mobile,
            width: "100%",
          }}
        >
          <Pressable accessibilityRole="link" onPress={goInternalHome}>
            <Image
              source={AterbankenLogotype}
              contentFit="contain"
              style={{ width: 123, height: 21 }}
            />
          </Pressable>
          <View style={{ flexDirection: "row" }}>
            {showActions && (
              <MobileAction
                icon="search"
                label="Sök"
                onPress={() => router.navigate("/internal/search")}
              />
            )}
            <MobileAction
              icon="hamburger"
              label="Meny"
              onPress={() => setMenuOpen(true)}
            />
          </View>
        </View>
      </View>
      <InternalMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onGoMarketplace={goMarketplace}
        showInternalLinks={!!showActions}
        showMemberManagement={!!showActions}
      />
    </>
  );
};

const MobileAction = ({
  icon,
  label,
  onPress,
}: {
  icon: "search" | "newListing" | "hamburger";
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityLabel={label}
    accessibilityRole="button"
    onPress={onPress}
    style={{
      alignItems: "center",
      height: 40,
      justifyContent: "center",
      width: 40,
    }}
  >
    <Icon icon={icon} size={18} color="primaryDark" />
  </Pressable>
);

const InternalMenu = ({
  open,
  onClose,
  onGoMarketplace,
  showInternalLinks,
  showMemberManagement,
}: {
  open: boolean;
  onClose: () => void;
  onGoMarketplace: () => void;
  showInternalLinks: boolean;
  showMemberManagement: boolean;
}) => (
  <SlideInSheet open={open} onClose={onClose} title="Återbanken">
    <View style={{ gap: 8 }}>
      {showInternalLinks && (
        <>
          <InternalMenuEntry
            label="Projekt"
            href="/internal/projects"
            onClose={onClose}
          />
        </>
      )}
      {showMemberManagement && (
        <InternalMenuEntry
          label="Organisationsmedlemmar"
          href="/internal/members"
          onClose={onClose}
        />
      )}
      <View style={{ marginTop: 16 }}>
        <Button
          label="Till externa marknadsplatsen"
          type="outlined"
          onPress={() => {
            onClose();
            onGoMarketplace();
          }}
          style={{ width: "100%" }}
        />
      </View>
    </View>
  </SlideInSheet>
);

const InternalMenuEntry = ({
  label,
  href,
  onClose,
}: {
  label: string;
  href: "/internal/projects" | "/internal/members";
  onClose: () => void;
}) => (
  <Pressable
    accessibilityRole="link"
    onPress={() => {
      onClose();
      router.push(href);
    }}
    style={{ paddingVertical: 12 }}
  >
    <Label size="large">{label}</Label>
  </Pressable>
);
