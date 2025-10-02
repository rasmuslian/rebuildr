import {
  CreateReportPurchaseMutation,
  CreateReportPurchaseMutationVariables,
  PurchaseStatusEnum,
  ReportPurchaseQuery,
  ReportPurchaseQueryVariables,
  ReportPurchaseTypeEnum,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Display, Body, Title, Headline } from "@components/typography/text";
import { useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { Divider } from "@components/dividers/divider";
import { Button } from "@components/buttons/button";
import { ProductHeader } from "@components/navigation/headers/product-header";
import { ProgressHeader } from "@components/navigation/headers/progress-header";
import { reportType } from "@constants/report-purchase";
import { TextInput } from "@components/forms/textInput";
import { InstructionSteps } from "@components/instruction-steps/instruction-steps";
import BuyersProtectionImage from "@assets/svgs/buyers-protection.svg";
import { Header } from "@components/navigation/headers/header";

const REPORT_PURCHASE = gql`
  query ReportPurchase($input: GetPurchaseInput!) {
    purchase(input: $input) {
      id
      buyerId
      status
      product {
        id
        title
        price
        status
        condition
        primaryQuantity
        primaryUnit
        primaryImage {
          id
          url
        }
      }
      reportPurchase {
        id
      }
    }
    me {
      id
    }
  }
`;

const CREATE_REPORT_PURCHASE = gql`
  mutation CreateReportPurchase($input: CreateReportPurchaseInput!) {
    createReportPurchase(input: $input) {
      id
    }
  }
`;

type ReportPurchaseBottomSheetProps = {
  purchaseId: string;
  show: boolean;
  onDismiss: () => void;
  onCreateReportComplete: () => void;
};

export const ReportPurchaseBottomSheet = ({
  purchaseId,
  show,
  onDismiss,
  onCreateReportComplete,
}: ReportPurchaseBottomSheetProps) => {
  const [type, setType] = useState<ReportPurchaseTypeEnum>();
  const [message, setMessage] = useState("");

  const { data } = useQuery<ReportPurchaseQuery, ReportPurchaseQueryVariables>(
    REPORT_PURCHASE,
    { variables: { input: { id: purchaseId } } },
  );
  const [
    createReport,
    { data: createReportData, loading: createReportLoading },
  ] = useMutation<
    CreateReportPurchaseMutation,
    CreateReportPurchaseMutationVariables
  >(CREATE_REPORT_PURCHASE);

  const onCreateReport = () => {
    if (createReportLoading || !type) {
      return;
    }
    createReport({
      variables: {
        input: {
          purchaseId,
          type,
          message,
        },
      },
      onCompleted: () => {
        onCreateReportComplete();
      },
    });
  };

  if (!data) {
    return null;
  }

  const progress = () => {
    if (!!data.purchase.reportPurchase || createReportData) {
      return 100;
    }
    if (type) {
      return 70;
    }
    return 50;
  };

  const showProductHeader =
    (!data.purchase.reportPurchase || !!createReportData) &&
    data.purchase.status === PurchaseStatusEnum.Delivered;
  const showCloseButton =
    !!data.purchase.reportPurchase ||
    !!createReportData ||
    data.purchase.status !== PurchaseStatusEnum.Delivered;

  return (
    <BottomSheet
      name="Create Report Purchase"
      open={show}
      header={
        <View style={{ gap: 16 }}>
          {data.purchase.status === PurchaseStatusEnum.Delivered ? (
            <ProgressHeader
              title="Rapportera problem med köp"
              progress={progress()}
              onBack={() => onDismiss()}
            />
          ) : (
            <Header
              title="Rapportera problem med köp"
              showBackButton={false}
              ctas={[
                {
                  icon: "X",
                  onPress: () => onDismiss(),
                },
              ]}
            />
          )}
          {showProductHeader && (
            <ProductHeader
              title={data.purchase.product.title}
              price={data.purchase.product.price}
              condition={data.purchase.product.condition}
              quantity={data.purchase.product.primaryQuantity}
              quantityUnit={data.purchase.product.primaryUnit}
              status={data.purchase.product.status}
              imageUrl={data.purchase.product.primaryImage?.url}
            />
          )}
        </View>
      }
      footer={
        showCloseButton ? (
          <Button label="Stäng" style={{ marginTop: 12 }} onPress={onDismiss} />
        ) : type ? (
          <Button
            label="Rapportera problem med köp"
            onPress={onCreateReport}
            loading={createReportLoading}
            style={{ marginTop: 12 }}
          />
        ) : undefined
      }
      screenHeight={
        !!createReportData ||
        !!data.purchase.reportPurchase ||
        data.purchase.status !== PurchaseStatusEnum.Delivered
      }
      onDismiss={onDismiss}
      scrollable
    >
      {createReportData ? (
        <EndScreen title="Vi har tagit emot din rapport" />
      ) : data.purchase.reportPurchase ? (
        <EndScreen title="Du har redan rapporterat det här köpet och vi tittar på det" />
      ) : data.purchase.status !== PurchaseStatusEnum.Delivered ? (
        <WrongStatusScreen />
      ) : (
        <View
          style={{
            flex: 1,
            paddingBottom: 12,
            gap: 24,
            marginTop: 24,
          }}
        >
          {type ? (
            <View style={{ gap: 12 }}>
              <Headline size="small">
                Vad stämmer inte med varan du fick?
              </Headline>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 24,
                  alignItems: "center",
                }}
              >
                <View style={{ gap: 4, flex: 1 }}>
                  <Title size="medium">{reportType[type].title}</Title>
                  <Body size="medium" color="secondary">
                    {reportType[type].description}
                  </Body>
                </View>
                <Button
                  label="Ändra"
                  onPress={() => setType(undefined)}
                  type="tonal"
                />
              </View>
            </View>
          ) : (
            <View style={{ gap: 24 }}>
              <Display size="small">
                Vad stämmer inte med varan du fick?
              </Display>
              {Object.values(ReportPurchaseTypeEnum).map((type, i) => (
                <TypeRow onPress={() => setType(type)} type={type} key={i} />
              ))}
            </View>
          )}
          <Divider />
          <View style={{ gap: 24 }}>
            <Display size="small">Vill du förklara lite mer?</Display>
            <Body size="medium">
              Skriv så tydligt du kan, t.ex. vad som inte stämmer, om något
              saknas eller om varan är skadad.
            </Body>
            <View style={{ marginBottom: 24 }}>
              <TextInput
                multiline
                style={{ minHeight: 172 }}
                value={message}
                placeholder="Vad stämmer inte med varan du fick?"
                onChangeText={(t) => setMessage(t.slice(0, 5000))}
              />
              <Body size="small" color="secondary" style={{ marginTop: 12 }}>
                {message.length} av 5000 tecken
              </Body>
            </View>
          </View>
        </View>
      )}
    </BottomSheet>
  );
};

type TypeRowProps = {
  onPress: () => void;
  type: ReportPurchaseTypeEnum;
};
const TypeRow = ({ onPress, type }: TypeRowProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
      }}
    >
      <View style={{ flex: 1 }}>
        <Title size="medium">{reportType[type].title}</Title>
        <Body size="medium" color="secondary">
          {reportType[type].description}
        </Body>
      </View>
      <Button onPress={onPress} label="Välj" />
    </View>
  );
};

type EndScreenProps = {
  title: string;
};
const EndScreen = ({ title }: EndScreenProps) => {
  return (
    <View style={{ gap: 24, marginTop: 24 }}>
      <View style={{ alignItems: "center", marginBottom: 26, marginTop: 24 }}>
        <Image
          source={BuyersProtectionImage.uri}
          style={{ width: 141, height: 141 }}
        />
      </View>
      <Display size="small" style={{ textAlign: "center" }}>
        {title}
      </Display>
      <Body size="medium" style={{ textAlign: "center", flex: 1 }}>
        Du har meddelat att något inte stämmer med varan. Utbetalningen till
        säljaren är pausad under tiden vi tittar på ärendet.
      </Body>
      <Divider />
      <InstructionSteps
        title="Vad händer nu?"
        steps={[
          "Vi granskar ditt ärende",
          "Vi fattar ett beslut baserat på informationen som finns",
          "Vi hör av oss via mejl om vi behöver mer information eller har ett svar till dig. Du får alltid återkoppling inom 24 timmar.",
        ]}
      />
    </View>
  );
};

const WrongStatusScreen = () => {
  return (
    <View style={{ gap: 24, marginTop: 24 }}>
      <View style={{ alignItems: "center", marginBottom: 26, marginTop: 24 }}>
        <Image
          source={BuyersProtectionImage.uri}
          style={{ width: 141, height: 141 }}
        />
      </View>
      <Display size="small" style={{ textAlign: "center" }}>
        Tidsfristen för att rapportera har gått ut
      </Display>
      <Body size="medium" style={{ textAlign: "center", flex: 1 }}>
        Du hade 48 timmar på dig att meddela om något inte stämde. Eftersom den
        tiden nu passerat har köpet räknats som godkänt och pengarna har
        betalats ut till säljaren.
      </Body>
      <Body size="medium" style={{ textAlign: "center", flex: 1 }}>
        Har du fortfarande frågor? Kontakta gärna vår kundtjänst.
      </Body>
    </View>
  );
};
