import {
  AccountPurchasesQuery,
  AccountPurchasesQueryVariables,
} from "@/gql/graphql";
import { isPurchaseDone } from "@/utils/purchases/purchases";
import { gql, useQuery } from "@apollo/client";
import { EmptyStateCard } from "@components/cards/empty-state-card";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { PurchaseCard } from "@components/purchases/purchase-card";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { AccordionSection } from "@components/sections/accordion-section";
import { SectionHeader } from "@components/sections/section-header";
import { Body, Display, Headline } from "@components/typography/text";
import { router } from "expo-router";
import { View } from "react-native";

const ACCOUNT_PURCHASES = gql`
  query AccountPurchases($input: MyPurchasesInput!) {
    myPurchases(input: $input) {
      id
      status
      paymentAcceptedAt
      sellerRespondedAt
      transportationMethod
      deliveredAt
      approvedAt
      failedAt
      product {
        id
        title
        status
        primaryQuantity
        primaryUnit
        condition
        primaryImage {
          id
          url
        }
        price
        seller {
          id
          username
          type
          profilePicture {
            id
            url
          }
        }
      }
      reportPurchase {
        id
        resolution
      }
    }
  }
`;

export default function Purchases() {
  const { data } = useQuery<
    AccountPurchasesQuery,
    AccountPurchasesQueryVariables
  >(ACCOUNT_PURCHASES, { variables: { input: { myRole: "buyer" } } });

  if (!data) {
    return <LoadingSpinner />;
  }

  const donePurchases = data.myPurchases.filter((purchase) =>
    isPurchaseDone(purchase),
  );
  const ongoingPurchases = data.myPurchases.filter(
    (purchase) => !isPurchaseDone(purchase),
  );

  const renderEmptyState = () => {
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
  };

  const renderContent = () => {
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

  return (
    <ScreenLayout headerComponent={<Header title="Dina köp" />}>
      <Display size="small" style={{ marginBottom: 24 }}>
        Pågående & avslutade köp
      </Display>
      {data.myPurchases.length ? renderContent() : renderEmptyState()}
    </ScreenLayout>
  );
}
