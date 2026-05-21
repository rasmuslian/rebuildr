import { View, Platform } from "react-native";
import React, { useEffect } from "react";
import QRCode from "react-native-qrcode-svg";
import { Logo } from "@components/logo/logo";
import { useThemeColor } from "@hooks/useThemeColor";
import { Label, Title, Body, Headline } from "@components/typography/text";
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

export const PRODUCT_LABEL_HOST_ID = "product-label-print-host";

type Product = NonNullable<GetProductQuery["product"]>;

const buildMeasurementsList = (product: Product): string[] => {
  const list: string[] = [];

  if (product.thickness) {
    list.push(
      `${measurements.THICKNESS.name} ${product.thickness} ${measurements.THICKNESS.options[product.thicknessUnit]?.name}`,
    );
  }
  if (product.width) {
    list.push(
      `${measurements.WIDTH.name} ${product.width} ${measurements.WIDTH.options[product.widthUnit]?.name}`,
    );
  }
  if (product.length) {
    list.push(
      `${measurements.LENGTH.name} ${product.length} ${measurements.LENGTH.options[product.lengthUnit]?.name}`,
    );
  }
  if (product.height) {
    list.push(
      `${measurements.HEIGHT.name} ${product.height} ${measurements.HEIGHT.options[product.heightUnit]?.name}`,
    );
  }
  if (product.diameter) {
    list.push(
      `${measurements.DIAMETER.name} ${product.diameter} ${measurements.DIAMETER.options[product.diameterUnit]?.name}`,
    );
  }
  if (product.weight) {
    list.push(
      `${measurements.WEIGHT.name} ${product.weight} ${measurements.WEIGHT.options[product.weightUnit]?.name}`,
    );
  }

  return list;
};

type ProductLabelProps = {
  product: Product;
  productId: string;
};

const ProductLabel = ({ product, productId }: ProductLabelProps) => {
  const colors = useThemeColor();
  const quantity = product.primaryQuantity ?? 0;
  const quantityUnit = product.primaryUnit ?? QuantityUnitEnum.Amount;
  const measurementsList = buildMeasurementsList(product);

  return (
    <View
      style={{
        flexDirection: "column",
        width: 375,
        height: 482,
        padding: 24,
        gap: 16,
        borderWidth: 1,
        borderColor: colors.dividers.neutral,
        borderRadius: borderRadius.medium,
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

      <View style={{ gap: 16, height: 212, overflow: "hidden" }}>
        <View style={{ gap: 4 }}>
          <Title size="large">{product.title}</Title>
          <Body color="secondary" size="small" numberOfLines={1}>
            {quantity} {quantities[quantityUnit].plural} •{" "}
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
};

type Props = {
  productId: string;
  onReady?: () => void;
};

export const ProductLabelSheet = ({ productId, onReady }: Props) => {
  const { data } = useQuery<GetProductQuery, GetProductQueryVariables>(
    GET_PRODUCT,
    {
      variables: { input: { id: productId } },
    },
  );

  const product = data?.product;

  useEffect(() => {
    if (product && onReady) onReady();
  }, [product, onReady]);

  if (!product) return null;

  return (
    <View
      nativeID={PRODUCT_LABEL_HOST_ID}
      style={{
        width: 786,
        height: 1000,
        padding: 12,
        flexDirection: "column",
        gap: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 12,
        }}
      >
        <ProductLabel product={product} productId={productId} />
        <ProductLabel product={product} productId={productId} />
      </View>
      <View
        style={{
          flexDirection: "row",
          gap: 12,
        }}
      >
        <ProductLabel product={product} productId={productId} />
        <ProductLabel product={product} productId={productId} />
      </View>
    </View>
  );
};
