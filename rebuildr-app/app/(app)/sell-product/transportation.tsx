import {
  TransportationQueryQuery,
  TransportationUpdateProductMutation,
  TransportationUpdateProductMutationVariables,
  UpdateProductInput,
} from "@/gql/graphql";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Toggle } from "@components/controls/toggle";
import { ProgressHeader } from "@components/create-product/progress-header";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Delivery } from "@components/transport/delivery";
import { Pickup } from "@components/transport/pickup";
import { Shipping } from "@components/transport/shipping";
import { Body, Display, Headline, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { router } from "expo-router";
import { PropsWithChildren, Suspense, useState } from "react";
import { View } from "react-native";

const TRANSPORTATION_QUERY = gql`
  query TransportationQuery {
    getDraftedProduct {
      id
      pickupEnabled
      deliveryPrice
      project {
        id
        title
        location {
          lat
          lng
        }
        approximatePlace {
          lat
          lng
          address
        }
      }
      shippingPrices {
        id
        maxWeight
        price
        provider
      }
    }
  }
`;

const TRANSPORTATION_UPDATE_PRODUCT = gql`
  mutation TransportationUpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      product {
        id
        pickupEnabled
        deliveryPrice
        shippingPrices {
          id
          maxWeight
          price
          provider
        }
      }
    }
  }
`;

export default function Transportation() {
  const [pickup, setPickup] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [delivery, setDelivery] = useState(false);

  const { data } = useQuery<TransportationQueryQuery>(TRANSPORTATION_QUERY, {
    onCompleted: (data) => {
      if (!data.getDraftedProduct) {
        console.error("No draft found");
        router.replace("/");
      }
    },
  });
  const [updateProduct] = useMutation<
    TransportationUpdateProductMutation,
    TransportationUpdateProductMutationVariables
  >(TRANSPORTATION_UPDATE_PRODUCT);

  const onUpdate = (input: UpdateProductInput) => {
    updateProduct({
      variables: {
        input,
      },
    });
  };

  const onSelectPickup = () => {
    setPickup(!pickup);
  };
  const onSelectShipping = () => {
    setShipping(!shipping);
  };
  const onSelectDropoff = () => {
    setDelivery(!delivery);
  };
  const onNext = () => {};
  const canContinue = () => {
    return false;
  };

  if (!data?.getDraftedProduct) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
        <ProgressHeader
          onClose={() =>
            router.canDismiss() ? router.dismiss() : router.replace("/")
          }
          title="Ny annons"
          prog3={0}
        />
      </View>
      <ScreenLayout style={{ gap: 24 }}>
        <Display size="small">Leverans</Display>
        <Headline size="small">
          Vilka leveransalternativ kan du erbjuda?
        </Headline>
        <View style={{ gap: 16, paddingBottom: 16 }}>
          <Card
            title="Avhämtning"
            description="Du bestämmer tid och plats för att köparen ska kunna hämta produkten direkt från dig."
            onPress={onSelectPickup}
            enabled={pickup}
          >
            {pickup ? (
              <Suspense fallback={<LoadingSpinner />}>
                <Divider />
                <Pickup productId={data.getDraftedProduct.id} />
              </Suspense>
            ) : null}
          </Card>
          <Card
            title="Fraktleverans"
            description="Du skickar produkten till köparen via ett fraktbolag."
            onPress={onSelectShipping}
            enabled={shipping}
          >
            {shipping ? (
              <Suspense fallback={<LoadingSpinner />}>
                <Divider />
                <Shipping
                  productId={data.getDraftedProduct.id}
                  onUpdate={onUpdate}
                />
              </Suspense>
            ) : null}
          </Card>
          <Card
            title="Hemtransport"
            description="Du erbjuder hemtransport och levererar produkten direkt till köparen."
            onPress={onSelectDropoff}
            enabled={delivery}
          >
            {delivery ? (
              <Suspense fallback={<LoadingSpinner />}>
                <Delivery productId={data.getDraftedProduct.id} />
              </Suspense>
            ) : null}
          </Card>
        </View>
        <View
          style={{
            paddingTop: 24,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Button
            icon="arrowLeft"
            label="Tillbaka"
            onPress={() => router.navigate("/sell-product/project")}
          />
          <Button
            label="Förhandsgranska"
            onPress={() => onNext()}
            type="tonal"
            style={{ flex: 1 }}
            disabled={!canContinue()}
            loading={false}
          />
        </View>
      </ScreenLayout>
    </>
  );
}

type CardProps = {
  title: string;
  description: string;
  enabled?: boolean;
  onPress: () => void;
} & PropsWithChildren;

const Card = ({
  title,
  description,
  enabled,
  onPress,
  children,
}: CardProps) => {
  const colors = useThemeColor();

  return (
    <View
      style={[
        {
          borderRadius: borderRadius.medium,
          backgroundColor: colors.buttons.tonal.enabled,
          padding: 16,
          gap: 24,
        },
        enabled && {
          borderColor: colors.textField.clicked,
          borderWidth: 1,
          padding: 15,
          backgroundColor: colors.background.neutral,
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ gap: 4, flex: 1 }}>
          <Title size="medium">{title}</Title>
          <Body size="medium" color="secondary">
            {description}
          </Body>
        </View>
        <Toggle value={enabled} onPress={onPress} />
      </View>
      {children}
    </View>
  );
};
