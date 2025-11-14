import { AccountPurchasesQuery } from "@/gql/graphql";
import { isPurchaseDone } from "@/utils/purchases/purchases";
import { EmptyStateCard } from "@components/cards/empty-state-card";
import { SectionHeader } from "@components/sections/section-header";
import { router } from "expo-router";
import { View } from "react-native";
import { PurchaseCard } from "./purchase-card";
import { Body, Headline } from "@components/typography/text";
import { Divider } from "@components/dividers/divider";
import { AccordionSection } from "@components/sections/accordion-section";
import { useEffect } from "react";
import { useScreenType } from "@hooks/useScreenType";

type Props = {
  myPurchases: AccountPurchasesQuery["myPurchases"];
  onPurchasePress?: (purchaseId: string) => void;
  selectedPurchaseId?: string | null;
};

export const PurchasesList = ({
  myPurchases,
  onPurchasePress,
  selectedPurchaseId,
}: Props) => {
  const { isDesktop } = useScreenType();
  const donePurchases = myPurchases.filter((purchase) =>
    isPurchaseDone(purchase),
  );
  const ongoingPurchases = myPurchases.filter(
    (purchase) => !isPurchaseDone(purchase),
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
        description="Du har inga köp ännu. När du hanldar något kommer det att visas här."
        cta={{
          label: "Bläddra bland annonser",
          onPress: () => router.navigate("/search"),
        }}
      />
    );
  }

  const ongoingPurchasesContent = ongoingPurchases?.map((purchase) => (
    <PurchaseCard
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
            Du har inga pågående köp just nu.
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
                <PurchaseCard
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
