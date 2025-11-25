import { EmptyStateCard } from "@components/cards/empty-state-card";
import { useSellProductContext } from "@context/sell-product-context";
import { router } from "expo-router";

type Props = {
  sellerIsMe: boolean;
};
export const ProductEmptyState = ({ sellerIsMe }: Props) => {
  const { setVisible: setSellProductVisible } = useSellProductContext();

  return (
    <EmptyStateCard
      header={sellerIsMe ? "Inga annonser än" : "Inga annonser här just nu"}
      description={
        sellerIsMe
          ? "Just nu har du inga annonser ute, men det är enkelt att komma igång"
          : "Den här säljaren har inga aktiva annonser för tillfället. Kika tillbaka senare eller utforska fler annonser på marknadsplatsen!"
      }
      cta={
        sellerIsMe
          ? {
              label: "Lägg upp en annons",
              onPress: () => setSellProductVisible(true),
            }
          : {
              label: "Se fler annonser",
              onPress: () => router.navigate("/search"),
            }
      }
    />
  );
};
