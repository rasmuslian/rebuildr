import { AccountSalesQuery, AccountSalesQueryVariables } from "@/gql/graphql";
import { isSaleDone } from "@/utils/sales/sales";
import { gql, useQuery } from "@apollo/client";
import { EmptyStateCard } from "@components/cards/empty-state-card";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { SellCard } from "@components/sales/sell-card";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { AccordionSection } from "@components/sections/accordion-section";
import { SectionHeader } from "@components/sections/section-header";
import { Body, Display, Headline } from "@components/typography/text";
import { useSellProductContext } from "@context/sell-product-context";
import { View } from "react-native";

const ACCOUNT_SALES = gql`
  query AccountSales($input: MyPurchasesInput!) {
    myPurchases(input: $input) {
      id
      status
      paymentAcceptedAt
      sellerRespondedAt
      transportationMethod
      deliveredAt
      failedAt
      buyer {
        id
        username
        type
        profilePicture {
          id
          url
        }
      }
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
      }
      reportPurchase {
        id
        resolution
      }
    }
  }
`;

export default function Sales() {
  const { setVisible } = useSellProductContext();
  const { data } = useQuery<AccountSalesQuery, AccountSalesQueryVariables>(
    ACCOUNT_SALES,
    { variables: { input: { myRole: "seller" } } },
  );

  if (!data) {
    return <LoadingSpinner />;
  }

  const donePurchases = data.myPurchases.filter((purchase) =>
    isSaleDone(purchase),
  );
  const ongoingPurchases = data.myPurchases.filter(
    (purchase) => !isSaleDone(purchase),
  );

  const renderEmptyState = () => {
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
  };

  const renderContent = () => {
    return (
      <>
        {ongoingPurchases.length ? (
          <View style={{ marginBottom: 24, gap: 16 }}>
            <SectionHeader>{`Pågående: ${ongoingPurchases.length} st`}</SectionHeader>
            {ongoingPurchases.map((purchase) => (
              <SellCard purchase={purchase} key={purchase.id} />
            ))}
          </View>
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
                  <SellCard purchase={purchase} key={purchase.id} />
                ))}
              </View>
            </AccordionSection>
          </View>
        )}
      </>
    );
  };

  return (
    <ScreenLayout headerComponent={<Header title="Dina försäljningar" />}>
      <Display size="small" style={{ marginBottom: 24 }}>
        Pågående & avslutade försäljningar
      </Display>
      {data.myPurchases.length ? renderContent() : renderEmptyState()}
    </ScreenLayout>
  );
}
