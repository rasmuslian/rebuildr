import {
  ShippingPrice,
  ShippingProviderEnum,
  ShippingQueryQuery,
  ShippingQueryQueryVariables,
  ShippingUpdateUserMutation,
  ShippingUpdateUserMutationVariables,
  UpdateShippingMutation,
  UpdateShippingMutationVariables,
  User,
} from "@/gql/graphql";
import { gql, useMutation, useSuspenseQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { Radio } from "@components/controls/radio";
import { Divider } from "@components/dividers/divider";
import { Form } from "@components/forms/form";
import { ToggleCard } from "@components/toggle-card/toggle-card";
import { Body, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";

const SHIPPING_QUERY = gql`
  query ShippingQuery($input: GetProductInput!) {
    getAllShippingPrices {
      id
      maxWeight
      price
      provider
    }
    product(input: $input) {
      id
      shippingPrices {
        id
        maxWeight
        price
        provider
      }
    }
    me {
      id
      name
      address
      postCode
      phoneNumber
      city
    }
  }
`;

const UPDATE_SHIPPING = gql`
  mutation UpdateShipping($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      product {
        id
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

const SHIPPING_UPDATE_USER = gql`
  mutation ShippingUpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        id
        name
        address
        postCode
        phoneNumber
        city
      }
    }
  }
`;
type Props = {
  productId: string;
  onShippingValid: (valid: boolean) => void;
  onShippingSelected: (selected: boolean) => void;
  shippingSelected: boolean;
};

export const Shipping = ({
  productId,
  onShippingValid,
  onShippingSelected,
  shippingSelected,
}: Props) => {
  const { data } = useSuspenseQuery<
    ShippingQueryQuery,
    ShippingQueryQueryVariables
  >(SHIPPING_QUERY, { variables: { input: { id: productId } } });
  const [name, setName] = useState<string | null | undefined>(data.me.name);
  const [phoneNumber, setPhoneNumber] = useState<string | null | undefined>(
    data.me.phoneNumber,
  );
  const [address, setAddress] = useState<string | null | undefined>(
    data.me.address,
  );
  const [postCode, setPostCode] = useState<string | null | undefined>(
    data.me.postCode,
  );
  const [city, setCity] = useState<string | null | undefined>(data.me.city);
  const [updateShipping] = useMutation<
    UpdateShippingMutation,
    UpdateShippingMutationVariables
  >(UPDATE_SHIPPING);
  const [updateUser, { loading: loadingUpdateUser }] = useMutation<
    ShippingUpdateUserMutation,
    ShippingUpdateUserMutationVariables
  >(SHIPPING_UPDATE_USER);
  const colors = useThemeColor();
  const [provider, setProvider] = useState<ShippingProviderEnum>(
    ShippingProviderEnum.Postnord,
  );

  const shippingValidHandler = (
    user: Partial<User>,
    shippingPrices?: Partial<ShippingPrice>[] | null,
  ) => {
    if (
      user.address &&
      user.name &&
      user.phoneNumber &&
      user.postCode &&
      user.city &&
      shippingPrices?.length
    ) {
      onShippingValid(true);
      return;
    }
    onShippingValid(false);
  };
  useEffect(
    () => shippingValidHandler(data.me, data.product.shippingPrices),
    [data],
  );

  const onSelectPrice = (id: string) => {
    updateShipping({
      variables: {
        input: {
          id: productId,
          shippingPriceIds: [id],
        },
      },
      onCompleted: (d) => {
        shippingValidHandler(data.me, d.updateProduct.product.shippingPrices);
      },
    });
  };
  const onSelectShipping = () => {
    if (shippingSelected) {
      updateShipping({
        variables: {
          input: {
            id: productId,
            shippingPriceIds: [],
          },
        },
        onCompleted: () => {
          onShippingSelected(false);
        },
      });
    } else {
      onShippingSelected(true);
    }
  };
  const onSaveDetails = () => {
    updateUser({
      variables: {
        input: {
          id: data.me.id,
          name,
          address,
          postCode,
          phoneNumber,
          city,
        },
      },
      onCompleted: (d) => {
        shippingValidHandler(d.updateUser.user, data.product.shippingPrices);
      },
    });
  };

  const isSelected = (shippingPrice: ShippingPrice) => {
    return !!data.product.shippingPrices?.find(
      (existingPrice) => existingPrice.id === shippingPrice.id,
    );
  };

  return (
    <ToggleCard
      title="Fraktleverans"
      description="Du skickar produkten till köparen via ett fraktbolag."
      onPress={onSelectShipping}
      enabled={shippingSelected}
    >
      <Divider />

      <View style={{ gap: 24 }}>
        <View>
          <Title size="medium">Välj vikt på paketet</Title>
          <Body size="medium" style={{ marginTop: 4, marginBottom: 16 }}>
            Får din vara plats i en flyttkartong går den att skicka. Men du kan
            också skicka långsmala paket, t.ex. lorem ipsum eller dolor.
          </Body>
          <Body size="medium" isLink>
            Se vår storleksguide
          </Body>
        </View>
        <View style={{ gap: 8 }}>
          {data.getAllShippingPrices
            .filter((shippingPrice) => shippingPrice.provider === provider)
            .map((shippingPrice, i) => (
              <Pressable
                key={i}
                onPress={() => onSelectPrice(shippingPrice.id)}
              >
                <View
                  style={[
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 16,
                      borderRadius: borderRadius.medium,
                    },
                    isSelected(shippingPrice)
                      ? {
                          padding: 15,
                          borderRadius: borderRadius.medium,
                          backgroundColor: colors.background.neutral,
                          borderWidth: 1,
                          borderColor: colors.textField.clicked,
                        }
                      : {
                          padding: 16,
                          borderRadius: borderRadius.medium,
                          backgroundColor: colors.buttons.tonal.enabled,
                        },
                  ]}
                >
                  <Title size="medium">Max {shippingPrice.maxWeight} kg</Title>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <Body size="medium" color="secondary">
                      {shippingPrice.price} kr
                    </Body>
                    <Radio
                      selected={isSelected(shippingPrice)}
                      onPress={() => {}}
                    />
                  </View>
                </View>
              </Pressable>
            ))}
        </View>
        <Divider />
        <View>
          <Title size="medium">Din adress </Title>
          <Body size="medium" style={{ marginTop: 4 }}>
            Den adress vi använder för eventuella returer.
          </Body>
          <Form
            style={{ gap: 16, marginTop: 16 }}
            fields={[
              {
                type: "text",
                value: name ?? data.me.name ?? "",
                onChange: (t) => setName(t),
                heading: "För- och efternamn",
              },
              {
                type: "text",
                value: phoneNumber ?? data.me.phoneNumber ?? "",
                onChange: (t) => setPhoneNumber(t),
                heading: "Telefonnummer",
              },
              {
                type: "text",
                value: address ?? data.me.address ?? "",
                onChange: (t) => setAddress(t),
                heading: "Gatuadress",
              },
              {
                type: "text",
                value: postCode ?? data.me.postCode ?? "",
                onChange: (t) => setPostCode(t),
                heading: "Postnummer",
                horizontalSize: 1,
              },
              {
                type: "text",
                value: city ?? data.me.city ?? "",
                onChange: (t) => setCity(t),
                heading: "Stad",
                horizontalSize: 2,
              },
            ]}
          />
          <Button
            style={{ marginTop: 16 }}
            label="Spara"
            onPress={onSaveDetails}
            loading={loadingUpdateUser}
          />
          <Body
            size="small"
            color="secondary"
            style={{ marginTop: 12, textAlign: "center" }}
          >
            Vi sparar den här adressen i dina kontoinställningar, så slipper du
            fylla i detta igen.
          </Body>
        </View>
      </View>
    </ToggleCard>
  );
};
