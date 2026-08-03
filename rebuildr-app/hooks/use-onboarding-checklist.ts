import { router } from "expo-router";
import { useSellProductContext } from "@context/sell-product-context";
import { useUser } from "@hooks/useUser";

export type ChecklistStepKey = "listing" | "profile" | "payout";

export type ChecklistStep = {
  key: ChecklistStepKey;
  title: string;
  description: string;
  done: boolean;
  onPress: () => void;
};

export const useOnboardingChecklist = () => {
  const { isLoggedIn, me, loading, refetch } = useUser();
  const { setVisible } = useSellProductContext();

  const hasListing = (me?.numberOfPublishedProducts ?? 0) > 0;
  const hasProfile = !!me?.profilePicture && !!me?.description;
  const canReceivePayment = !!me?.sellerAccount?.canReceivePayment;

  const steps: ChecklistStep[] = [
    {
      key: "listing",
      title: "Lägg upp din första annons",
      description: "Lägg till foton, så skriver vår AI annonsen åt dig.",
      done: hasListing,
      onPress: () => setVisible(true),
    },
    {
      key: "profile",
      title: "Komplettera din profil",
      description:
        "Lägg till en profilbild och en kort presentation — det ökar tryggheten.",
      done: hasProfile,
      onPress: () => {
        if (me)
          router.navigate({
            pathname: "/account/profile",
            params: { userId: me.id },
          });
      },
    },
    {
      key: "payout",
      title: "Aktivera utbetalningar",
      description:
        "Koppla ditt utbetalningskonto så du kan få betalt när du sålt.",
      done: canReceivePayment,
      onPress: () => router.navigate("/account/settings/payout"),
    },
  ];

  const completedCount = steps.filter((step) => step.done).length;

  return {
    isLoggedIn,
    loading,
    refetch,
    steps,
    completedCount,
    allDone: completedCount === steps.length,
  };
};
