import { AccountSalesQuery } from "@/gql/graphql";
import { isSaleDone } from "@/utils/sales/sales";
import { EmptyStateCard } from "@components/cards/empty-state-card";
import { Divider } from "@components/dividers/divider";
import { SellCard } from "@components/sales/sell-card";
import { AccordionSection } from "@components/sections/accordion-section";
import { SectionHeader } from "@components/sections/section-header";
import { Body, Headline } from "@components/typography/text";
import { useSellProductContext } from "@context/sell-product-context";
import { useScreenType } from "@hooks/useScreenType";
import { useEffect } from "react";
import { View } from "react-native";

type Props = {
  myPurchases: AccountSalesQuery["myPurchases"];
  onPurchasePress?: (purchaseId: string) => void;
  selectedPurchaseId?: string | null;
};

export const SalesList = ({
  myPurchases,
  onPurchasePress,
  selectedPurchaseId,
}: Props) => {
  const { isDesktop } = useScreenType();
  const { setVisible } = useSellProductContext();

  const donePurchases = myPurchases.filter((purchase) => isSaleDone(purchase));
  const ongoingPurchases = myPurchases.filter(
    (purchase) => !isSaleDone(purchase),
  );

  useEffect(() => {
    if (myPurchases.length > 0 && !!onPurchasePress && !selectedPurchaseId) {
      if (ongoingPurchases.length > 0) {
        onPurchasePress?.(ongoingPurchases[0].id);
      } else if (donePurchases.length > 0) {
        onPurchasePress?.(donePurchases[0].id);
      }
    }
  }, [myPurchases]);

  if (myPurchases.length === 0) {
    return (
      <EmptyStateCard
        header="Här var det tomt!"
        description="Du har inte sålt något ännu. När du gör en försäljning kommer den att visas här."
        cta={{
          label: "Lägg upp en annons",
          onPress: () => setVisible(true),
        }}
      />
    );
  }

  const ongoingPurchasesContent = ongoingPurchases?.map((purchase) => (
    <SellCard
      purchase={purchase}
      key={purchase.id}
      onPress={onPurchasePress}
      selected={selectedPurchaseId === purchase.id}
    />
  ));

  return (
    <>
      {ongoingPurchases.length ? (
        <>
          {isDesktop ? (
            <AccordionSection
              title={`Pågående: ${ongoingPurchases.length} st`}
              initialOpen
            >
              {ongoingPurchasesContent}
            </AccordionSection>
          ) : (
            <View style={{ marginBottom: 24, gap: 16 }}>
              <SectionHeader>{`Pågående: ${ongoingPurchases.length} st`}</SectionHeader>
              {ongoingPurchasesContent}
            </View>
          )}
        </>
      ) : (
        <View style={{ marginBottom: 16 }}>
          <Headline size="small">Pågående</Headline>
          <Body color="secondary" style={{ marginTop: 2 }}>
            Du har inga pågående försäljningar just nu.
          </Body>
        </View>
      )}
      <Divider />
      {!!donePurchases.length && (
        <View style={{ marginTop: 16 }}>
          <AccordionSection
            title={`Avslutade: ${donePurchases.length} st`}
            initialOpen
          >
            <View style={{ gap: 16 }}>
              {donePurchases.map((purchase) => (
                <SellCard
                  purchase={purchase}
                  key={purchase.id}
                  onPress={onPurchasePress}
                  selected={selectedPurchaseId === purchase.id}
                />
              ))}
            </View>
          </AccordionSection>
        </View>
      )}
    </>
  );
};
