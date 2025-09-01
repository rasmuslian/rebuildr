import {
  CreateReportProductMutation,
  CreateReportProductMutationVariables,
  ReportProductQuery,
  ReportProductQueryVariables,
  ReportProductTypeEnum,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { Display, Body, Title, Headline } from "@components/typography/text";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRef, useEffect, useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { Divider } from "@components/dividers/divider";
import { Button } from "@components/buttons/button";
import { ProductHeader } from "@components/navigation/headers/product-header";
import { ProgressHeader } from "@components/navigation/headers/progress-header";
import { TextInput } from "@components/forms/textInput";
import { Header } from "@components/navigation/headers/header";
import FlowerHand from "@assets/images/flower-hand.png";
import { reportType } from "@constants/report-product";

const REPORT_PRODUCT = gql`
  query ReportProduct($input: GetProductInput!) {
    product(input: $input) {
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
      reportProducts {
        id
        reporterId
      }
    }
    me {
      id
    }
  }
`;

const CREATE_REPORT_PRODUCT = gql`
  mutation CreateReportProduct($input: CreateReportProductInput!) {
    createReportProduct(input: $input) {
      id
      reporterId
    }
  }
`;

type ReportProductBottomSheetProps = {
  productId: string;
  show: boolean;
  onDismiss: () => void;
};

export const ReportProductBottomSheet = ({
  productId,
  show,
  onDismiss,
}: ReportProductBottomSheetProps) => {
  const [type, setType] = useState<ReportProductTypeEnum>();
  const [message, setMessage] = useState("");

  const ref = useRef<BottomSheetModal>(null);

  const { data, refetch } = useQuery<
    ReportProductQuery,
    ReportProductQueryVariables
  >(REPORT_PRODUCT, {
    variables: { input: { id: productId } },
  });
  const [
    createReport,
    {
      data: createReportData,
      loading: createReportLoading,
      reset: resetReportData,
    },
  ] = useMutation<
    CreateReportProductMutation,
    CreateReportProductMutationVariables
  >(CREATE_REPORT_PRODUCT);

  const onCreateReport = () => {
    if (createReportLoading || !type) {
      return;
    }
    createReport({
      variables: {
        input: {
          productId,
          type,
          message,
        },
      },
      onCompleted: () => {
        refetch();
      },
    });
  };

  useEffect(() => {
    if (show) {
      ref.current?.present();
      resetReportData();
    } else {
      ref.current?.dismiss();
    }
  }, [show]);

  if (!data) {
    return null;
  }

  const progress = () => {
    if (!!alreadyReported || createReportData) {
      return 100;
    }
    if (type) {
      return 70;
    }
    return 50;
  };

  const alreadyReported = data.product.reportProducts.some(
    (rp) => rp.reporterId === data.me.id,
  );
  const showProductHeader = !alreadyReported && !createReportData;
  const showCloseButton = !!alreadyReported || !!createReportData;

  return (
    <BottomSheet
      name="Create Report Product"
      header={
        <View style={{ gap: 16 }}>
          {!alreadyReported ? (
            <ProgressHeader
              title="Anmäl annons"
              progress={progress()}
              onBack={() => onDismiss()}
            />
          ) : (
            <Header title="Anmäl annons" onBack={() => onDismiss()} />
          )}
          {showProductHeader && (
            <ProductHeader
              title={data.product.title}
              price={data.product.price}
              condition={data.product.condition}
              quantity={data.product.primaryQuantity}
              quantityUnit={data.product.primaryUnit}
              status={data.product.status}
              imageUrl={data.product.primaryImage?.url}
            />
          )}
        </View>
      }
      footer={
        showCloseButton ? (
          <Button label="Stäng" onPress={onDismiss} />
        ) : type ? (
          <Button
            label="Skicka anmälan"
            onPress={onCreateReport}
            loading={createReportLoading}
          />
        ) : undefined
      }
      ref={ref}
      screenHeight={!!createReportData || !!alreadyReported}
      onDismiss={onDismiss}
      scrollable
    >
      {createReportData ? (
        <EndScreen
          title="Tack för att du delade med dig!"
          text="Det hjälper andra att känna sig tryggare när de handlar och gör Rebuildr lite bättre för alla."
        />
      ) : alreadyReported ? (
        <EndScreen
          title="Tack, vi har redan fått din anmälan"
          text="Tack för att du flaggade! Vi har fått in din anmälan och ser nu över den."
        />
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
              {Object.values(ReportProductTypeEnum).map((type, i) => (
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
  type: ReportProductTypeEnum;
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
  text: string;
};
const EndScreen = ({ title, text }: EndScreenProps) => {
  return (
    <View style={{ gap: 24, marginTop: 24 }}>
      <View style={{ alignItems: "center", marginBottom: 26, marginTop: 24 }}>
        <Image source={FlowerHand.uri} style={{ width: 141, height: 141 }} />
      </View>
      <Display size="small" style={{ textAlign: "center" }}>
        {title}
      </Display>
      <Body size="medium" style={{ textAlign: "center", flex: 1 }}>
        {text}
      </Body>
    </View>
  );
};
