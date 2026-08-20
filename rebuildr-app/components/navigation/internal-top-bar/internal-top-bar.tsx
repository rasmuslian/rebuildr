import { Button } from "@components/buttons/button";
import { Logo } from "@components/logo/logo";
import { SearchBar } from "@components/search/search-bar";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import { primitives } from "@constants/colors";
import { isWeb, WEB_STICKY } from "@constants/layout";
import { Label } from "@components/typography/text";
import { LoginModalContext } from "@context/loginModalContext";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useScreenType } from "@hooks/useScreenType";
import { useThemeColor } from "@hooks/useThemeColor";
import { useUser } from "@hooks/useUser";
import { Icon } from "@icons/icon";
import { router } from "expo-router";
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

  return (
    <View
      style={isWeb ? { position: WEB_STICKY, top: 0, zIndex: 100 } : undefined}
    >
      {isDesktop ? (
        <InternalTopBarDesktop
          home={home}
          showActions={showActions}
          showSearchBar={showSearchBar}
          onCreateAd={onCreateAd}
        />
      ) : (
        <InternalTopBarMobile
          home={home}
          showActions={showActions}
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
          alignItems: "center",
          backgroundColor: home
            ? primitives.accent100
            : colors.background.neutral,
          borderBottomColor: colors.dividers.neutral,
          borderBottomWidth: home ? 0 : 1,
          flexDirection: "row",
          height: 72,
          justifyContent: "space-between",
          paddingHorizontal: 75,
          width: "100%",
        }}
      >
        <View style={{ alignItems: "center", flexDirection: "row", gap: 20 }}>
          <Pressable accessibilityRole="link" onPress={goInternalHome}>
            <Logo width={118} height={24} customColor={colors.logo.vector} />
          </Pressable>
          <Label size="large">Internlagret</Label>
          {showActions && showSearchBar && (
            <SearchBar
              backgroundColor="transparent"
              searchOnSubmit
              searchScope="internal"
              placeholder="Sök i internlagret"
              style={{ borderBottomWidth: 0, width: 320 }}
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
            <Button label="Ny intern annons" onPress={createInternalAd} />
          )}
        </View>
      </View>
      <InternalMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onGoMarketplace={goMarketplace}
        showInternalLinks={showActions}
      />
    </>
  );
};

const InternalTopBarMobile = ({ home, showActions, onCreateAd }: Props) => {
  const colors = useThemeColor();
  const [menuOpen, setMenuOpen] = useState(false);
  const { goInternalHome, goMarketplace } = useInternalNavigation();
  const createInternalAd = useCreateInternalAd(onCreateAd);

  return (
    <>
      <View
        style={{
          backgroundColor: home
            ? primitives.accent100
            : colors.background.neutral,
          borderBottomColor: colors.dividers.neutral,
          borderBottomWidth: home ? 0 : 1,
        }}
      >
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            height: 56,
            justifyContent: "space-between",
            paddingHorizontal: 16,
          }}
        >
          <Pressable accessibilityRole="link" onPress={goInternalHome}>
            <View
              style={{ alignItems: "center", flexDirection: "row", gap: 8 }}
            >
              <Logo width={70} height={14} customColor={colors.logo.vector} />
              <Label size="small">Internlagret</Label>
            </View>
          </Pressable>
          <View style={{ flexDirection: "row" }}>
            {showActions && (
              <>
                <MobileAction
                  icon="search"
                  label="Sök"
                  onPress={() => router.navigate("/internal/search")}
                />
                <MobileAction
                  icon="newListing"
                  label="Ny intern annons"
                  onPress={createInternalAd}
                />
              </>
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
        showInternalLinks={showActions}
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
}: {
  open: boolean;
  onClose: () => void;
  onGoMarketplace: () => void;
  showInternalLinks: boolean;
}) => (
  <SlideInSheet open={open} onClose={onClose} title="Internlagret">
    <View style={{ gap: 8 }}>
      {showInternalLinks && (
        <>
          <InternalMenuEntry
            label="Interna projekt"
            href="/internal/projects"
            onClose={onClose}
          />
          <InternalMenuEntry
            label="Organisationsmedlemmar"
            href="/internal/members"
            onClose={onClose}
          />
        </>
      )}
      <View style={{ marginTop: 16 }}>
        <Button
          label="Gå till externa marknadsplatsen"
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
      router.navigate(href);
    }}
    style={{ paddingVertical: 12 }}
  >
    <Label size="large">{label}</Label>
  </Pressable>
);
