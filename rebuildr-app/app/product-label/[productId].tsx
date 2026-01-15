import { View, Platform } from "react-native";
import React from "react";
import QRCode from "react-native-qrcode-svg";
import { Logo } from "@components/logo/logo";
import { useThemeColor } from "@hooks/useThemeColor";
import { Label, Title, Body, Headline } from "@components/typography/text";
import { useLocalSearchParams } from "expo-router";
import { gql, useQuery } from "@apollo/client";
import {
  GetProductQuery,
  GetProductQueryVariables,
  QuantityUnitEnum,
  UserType,
} from "@/gql/graphql";
import { quantities } from "@constants/quantities";
import { conditions } from "@constants/conditions";
import { measurements } from "@constants/measurements";
import { Divider } from "@components/dividers/divider";
import { Avatar } from "@components/avatar/avatar";
import { borderRadius } from "@constants/sizes";

const GET_PRODUCT = gql`
  query GetProduct($input: GetProductInput!) {
    product(input: $input) {
      id
      title
      description
      primaryQuantity
      primaryUnit
      condition
      price
      thickness
      thicknessUnit
      width
      widthUnit
      height
      heightUnit
      length
      lengthUnit
      diameter
      diameterUnit
      weight
      weightUnit
      brand {
        id
        name
        type
      }
      category {
        id
        name
        parent {
          id
          name
        }
      }
      seller {
        id
        name
        username
        profilePicture {
          id
          name
          url
        }
      }
    }
  }
`;

export default function PrintproductLabel() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const colors = useThemeColor();

  const { data } = useQuery<GetProductQuery, GetProductQueryVariables>(
    GET_PRODUCT,
    {
      variables: {
        input: {
          id: productId,
        },
      },
    },
  );

  const product = data?.product;
  if (!product) return;

  const quantity = product.primaryQuantity ?? 0;
  const quantityUnit = product.primaryUnit ?? QuantityUnitEnum.Amount;

  const measurementsList: string[] = [];

  if (product.thickness) {
    measurementsList.push(
      `${measurements.thickness.name} ${product.thickness} ${measurements.thickness.options[product.thicknessUnit]?.name}`,
    );
  }

  if (product.width) {
    measurementsList.push(
      `${measurements.width.name} ${product.width} ${measurements.width.options[product.widthUnit]?.name}`,
    );
  }

  if (product.length) {
    measurementsList.push(
      `${measurements.length.name} ${product.length} ${measurements.length.options[product.lengthUnit]?.name}`,
    );
  }

  if (product.height) {
    measurementsList.push(
      `${measurements.height.name} ${product.height} ${measurements.height.options[product.heightUnit]?.name}`,
    );
  }

  if (product.diameter) {
    measurementsList.push(
      `${measurements.diameter.name} ${product.diameter} ${measurements.diameter.options[product.diameterUnit]?.name}`,
    );
  }

  if (product.weight) {
    measurementsList.push(
      `${measurements.weight.name} ${product.weight} ${measurements.weight.options[product.weightUnit]?.name}`,
    );
  }

  const ProductLabel = () => (
    <View
      style={{
        flexDirection: "column",
        width: 375,
        height: 530,
        padding: 24,
        gap: 16,
        borderWidth: 1,
        borderColor: colors.dividers.neutral,
        borderRadius: borderRadius.medium,
        margin: "auto",
      }}
    >
      <View style={{ flexDirection: "row", gap: 16, paddingBottom: 8 }}>
        <View style={{ flexDirection: "column", gap: 16, width: 211 }}>
          <Logo width={167} height={33} customColor={colors.logo.vector} />
          <Label size="large">
            Scanna QR-koden för fler bilder och detaljer
          </Label>
        </View>

        {Platform.OS === "web" && (
          <QRCode value={`${window.origin}/product/${productId}`} size={100} />
        )}
      </View>

      <Divider />

      <View style={{ gap: 16, height: 262, overflow: "hidden" }}>
        <View style={{ gap: 4 }}>
          <Title size="large">{product.title}</Title>
          <Body color="secondary" size="small" numberOfLines={1}>
            {quantity} {quantities[quantityUnit].short} •{" "}
            {conditions[product.condition].name}
          </Body>
        </View>
        <Headline size="large">{product.price} kr</Headline>

        <View style={{ gap: 4 }}>
          {product.brand && (
            <Body size="medium">Varumärke: {product.brand.name}</Body>
          )}

          <Body size="medium">{measurementsList.join(", ")}</Body>

          {product.category && (
            <Body size="medium">
              Kategori:{" "}
              {product.category.parent && `${product.category.parent.name}, `}
              {product.category.name}
            </Body>
          )}
        </View>
      </View>

      <Divider />

      <View
        style={{
          flexDirection: "row",
          gap: 8,
          marginTop: "auto",
        }}
      >
        <Avatar
          size={48}
          imageUrl={product.seller.profilePicture?.url}
          placeholder={UserType.Personal}
        />
        <View style={{ gap: 4 }}>
          <Title size="medium">{product.seller.username}</Title>
          <Body size="medium">Scanna för att se fler annonser</Body>
        </View>
      </View>
    </View>
  );

  return (
    <>
      {Platform.OS === "web" && (
        <style>
          {`@media print {
            @page {
              margin: 12px;
            }
            body {
              margin: 0px;
              zoom: 0.90;
            }
          }`}
        </style>
      )}
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-around",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <ProductLabel />
          <ProductLabel />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <ProductLabel />
          <ProductLabel />
        </View>
      </View>
    </>
  );
}
