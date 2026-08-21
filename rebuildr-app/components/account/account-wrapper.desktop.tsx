import { useEffect, useState } from "react";
import AccountContent from "./account-content";
import { SlideInHeader } from "@components/slide-in-sheet/slide-in-sheet";
import { View } from "react-native";
import Notifications from "@/app/(app)/account/settings/notifications";
import Payout from "@/app/(app)/account/settings/payout";
import Add from "@/app/(app)/account/settings/payout/add";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import DeleteAccount from "@/app/(app)/account/settings/delete-account";
import User from "@/app/(app)/account/settings/user";
import Settings from "@/app/(app)/account/settings";
import { OrganizationMembers } from "./organization-members";

export type AccountState = {
  page:
    | "index"
    | "settings"
    | "payout-index"
    | "payout-add"
    | "notifications"
    | "delete-account"
    | "user"
    | "organization-members";
  params?: Record<string, string | number>;
};

type Props = {
  onClose: () => void;
  initialPage: AccountState["page"] | false;
};

export const AccountWrapperDesktop = ({
  onClose,
  initialPage = "index",
}: Props) => {
  const [state, setState] = useState<AccountState>({
    page: initialPage || "index",
    params: {},
  });

  useEffect(() => {
    if (initialPage) {
      setState({ page: initialPage, params: {} });
    }
  }, [initialPage]);

  switch (state.page) {
    case "index":
      return (
        <>
          <View style={{ marginHorizontal: -48, paddingBottom: 24 }}>
            <SlideInHeader title="Konto" onClose={onClose} />
          </View>
          <AccountContent onNavigation={setState} onClose={onClose} />
        </>
      );
    case "settings":
      return (
        <Settings
          onBack={() => setState({ page: "index", params: {} })}
          onNavigation={setState}
        />
      );
    case "payout-index": {
      const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PK!);
      return (
        <Elements stripe={stripePromise}>
          <Payout
            onBack={() => setState({ page: "settings", params: {} })}
            onNavigation={setState}
          />
        </Elements>
      );
    }
    case "payout-add": {
      const stripePromise = loadStripe(process.env.EXPO_PUBLIC_STRIPE_PK!);
      return (
        <Elements stripe={stripePromise}>
          <Add
            onBack={() => setState({ page: "payout-index", params: {} })}
            onNavigation={setState}
          />
        </Elements>
      );
    }
    case "notifications":
      return (
        <Notifications
          onBack={() => setState({ page: "settings", params: {} })}
          onNavigation={setState}
        />
      );
    case "delete-account":
      return (
        <DeleteAccount
          onBack={() => setState({ page: "settings", params: {} })}
          onClose={onClose}
        />
      );
    case "user":
      return (
        <User
          onBack={() => setState({ page: "settings", params: {} })}
          initialSection={state.params?.initialSection as string | undefined}
        />
      );
    case "organization-members":
      return (
        <OrganizationMembers
          onBack={() => setState({ page: "index", params: {} })}
        />
      );
    default:
      return null;
  }
};
