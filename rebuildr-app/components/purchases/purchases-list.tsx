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

type Props = {
  myPurchases: AccountPurchasesQuery["myPurchases"];
};

export const PurchasesList = ({ myPurchases }: Props) => {
  const donePurchases = myPurchases.filter((purchase) =>
    isPurchaseDone(purchase),
  );
  const ongoingPurchases = myPurchases.filter(
    (purchase) => !isPurchaseDone(purchase),
  );

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

  return (
    <>
      {ongoingPurchases.length ? (
        <View style={{ marginBottom: 24, gap: 16 }}>
          <SectionHeader>{`Pågående: ${ongoingPurchases.length} st`}</SectionHeader>
          {ongoingPurchases.map((purchase) => (
            <PurchaseCard purchase={purchase} key={purchase.id} />
          ))}
        </View>
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
                <PurchaseCard purchase={purchase} key={purchase.id} />
              ))}
            </View>
          </AccordionSection>
        </View>
      )}
    </>
  );
};
