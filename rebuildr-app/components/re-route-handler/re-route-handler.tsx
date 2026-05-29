import { AccountState } from "@components/account/account-wrapper.desktop";
import { useScreenType } from "@hooks/useScreenType";
import { router, usePathname } from "expo-router";
import { PropsWithChildren, useEffect } from "react";
import { useReactiveVar } from "@apollo/client";
import { isLoggedInVar } from "@/apollo/config";

export const ReRouteHandler = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const { isDesktop } = useScreenType();
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const navigateToLandingAccountModal = (page: AccountState["page"]) => {
    router.navigate({
      pathname: "/",
      params: { account: page },
    });
  };

  const purchaseRegex = new RegExp("^/account/purchases/([^/]+)$");
  const saleRegex = new RegExp("^/account/sales/([^/]+)$");
  const conversationProductRegex = new RegExp("^/conversations/([^/]+)$");
  const conversationUserRegex = new RegExp("^/conversations/([^/]+)/([^/]+)$");

  useEffect(() => {
    if (!isDesktop) {
      return;
    }

    switch (pathname) {
      case "/categories": {
        router.navigate({
          pathname: "/",
          params: { category: "all" },
        });
        break;
      }
      case "/search":
        router.navigate({
          pathname: "/search/products",
        });
        break;
      default:
        break;
    }

    if (!isLoggedIn) {
      return;
    }

    switch (pathname) {
      case "/account":
        navigateToLandingAccountModal("index");
        break;
      case "/account/settings":
        navigateToLandingAccountModal("settings");
        break;
      case "/account/settings/payout":
        navigateToLandingAccountModal("payout-index");
        break;
      case "/account/settings/payout/add":
        navigateToLandingAccountModal("payout-add");
        break;
      case "/account/settings/notifications":
        navigateToLandingAccountModal("notifications");
        break;
      case "/account/settings/delete-account":
        navigateToLandingAccountModal("delete-account");
        break;
      case "/account/settings/user":
        navigateToLandingAccountModal("user");
        break;
      case "/account/settings/add-business":
        navigateToLandingAccountModal("business-add");
        break;
      default:
        break;
    }

    if (purchaseRegex.test(pathname)) {
      const match = pathname.match(purchaseRegex);
      const purchaseId = match ? match[1] : null;
      if (!purchaseId) {
        return;
      }
      router.navigate({
        pathname: "/account/purchases",
        params: { purchaseId },
      });
    }
    if (saleRegex.test(pathname)) {
      const match = pathname.match(saleRegex);
      const saleId = match ? match[1] : null;
      if (!saleId) {
        return;
      }
      router.navigate({
        pathname: "/account/sales",
        params: { saleId },
      });
    }

    if (conversationUserRegex.test(pathname)) {
      const match = pathname.match(conversationUserRegex);
      const productId = match ? match[1] : null;
      const otherUserId = match ? match[2] : null;
      if (!productId || !otherUserId) {
        return;
      }
      router.navigate({
        pathname: "/conversations",
        params: {
          productId,
          userId: otherUserId,
        },
      });
    } else if (conversationProductRegex.test(pathname)) {
      const match = pathname.match(conversationProductRegex);
      const productId = match ? match[1] : null;
      if (!productId) {
        return;
      }
      router.navigate({
        pathname: "/conversations",
        params: {
          productId,
        },
      });
    }
  }, [pathname, isDesktop, isLoggedIn]);

  return <>{children}</>;
};
