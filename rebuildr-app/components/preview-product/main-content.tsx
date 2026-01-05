import {
  Brand,
  Category,
  ProductStatusEnum,
  ProductViewQuery,
} from "@/gql/graphql";
import { FilterChip } from "@components/chips/filterChip";
import { Divider } from "@components/dividers/divider";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { conditions } from "@constants/conditions";
import { quantities } from "@constants/quantities";
import React from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import * as Linking from "expo-linking";
import { measurements } from "@constants/measurements";
import { CollapsableText } from "@components/collapsable-text/collapsable-text";
import { formatPrice } from "@/utils/formattings";
import { ProductFields } from "@components/upsert-product/types";
import { SectionHeader } from "@components/sections/section-header";
import { Breadcrumbs } from "./breadcrumbs";
import { colorTypes } from "@constants/product-color-types";

type Props = {
  product: ProductViewQuery["product"] | ProductFields;
  brand?: Brand | null;
  category?: Pick<Category, "id" | "name"> | null;
  parentCategory?: Pick<Category, "id" | "name"> | null;
  documents: { url: string; name?: string | null }[];
  myAddress?: string | null;
  sellerIsMe?: boolean;
  actionSection?: React.ReactNode;
};

export const MainContent = ({
  product,
  brand,
  category,
  parentCategory,
  myAddress,
  documents,
  sellerIsMe,
  actionSection,
}: Props) => {
  const approximatePlace = product.approximatePlace;

  const showSpecificsMeasurements =
    product.width ||
    product.height ||
    product.thickness ||
    product.length ||
    product.weight;
  const showSpecificsDocuments = !!product.documents?.length;

  return (
    <View style={{ gap: 24 }}>
      <Breadcrumbs parentCategory={parentCategory} category={category} />
      <View>
        <Title size="large">{product.title}</Title>
        <Body size="large" color="secondary">
          {product.primaryQuantity}{" "}
          {product.primaryUnit ? quantities[product.primaryUnit].short : ""} •{" "}
          {product.condition ? conditions[product.condition].name : ""}
        </Body>
      </View>
      {product.status !== ProductStatusEnum.Sold && (
        <View>
          <Headline size="large" style={{ marginBottom: 8 }}>
            {formatPrice(product.price)}
          </Headline>
          <View style={{ gap: 2 }}>
            {product.pickupEnabled && (
              <Body size="medium" color="secondary">
                • Hämta själv:{" "}
                <Body size="medium" isLink>
                  {approximatePlace?.address}
                </Body>
              </Body>
            )}
            {!!product.shippingPrices?.length && (
              <Body size="medium" color="secondary">
                • Fraktleverans från{" "}
                {product.shippingPrices.reduce(
                  (acc: number | null, curr) =>
                    acc ? (curr.price < acc ? curr.price : acc) : curr.price,
                  null,
                )}{" "}
                kr
              </Body>
            )}
            {product.deliveryEnabled && (
              <Body size="medium" color="secondary">
                • Hemtransport{" "}
                {!sellerIsMe && (
                  <>
                    <Body size="medium" color="secondary">
                      till{" "}
                    </Body>
                    <Body size="medium" isLink>
                      {myAddress}{" "}
                    </Body>
                  </>
                )}
                från {product.deliveryPrice ?? 0} kr
              </Body>
            )}
          </View>
        </View>
      )}
      {actionSection}
      <Divider />
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {product.primaryQuantity && product.primaryUnit && (
            <ProductChip
              boldText={`${product.primaryQuantity} ${quantities[product.primaryUnit].short}`}
            />
          )}
          {product.secondaryQuantity && product.secondaryUnit && (
            <ProductChip
              boldText={`${product.secondaryQuantity} ${quantities[product.secondaryUnit].short}`}
            />
          )}
          {product.condition && (
            <ProductChip boldText={conditions[product.condition].name} />
          )}
          {brand && <ProductChip boldText={brand.name} />}
          {!!product.thickness && (
            <ProductChip
              boldText={`${product.thickness} ${measurements.thickness.options[product.thicknessUnit]?.name}`}
            />
          )}
          {!!product.height && (
            <ProductChip
              boldText={`${product.height} ${measurements.height.options[product.heightUnit]?.name}`}
            />
          )}
          {!!product.width && (
            <ProductChip
              boldText={`${product.width} ${measurements.width.options[product.widthUnit]?.name}`}
            />
          )}
          {!!product.length && (
            <ProductChip
              boldText={`${product.length} ${measurements.length.options[product.lengthUnit]?.name}`}
            />
          )}
          {!!product.diameter && (
            <ProductChip
              boldText={`${product.diameter} ${measurements.diameter.options[product.diameterUnit]?.name}`}
            />
          )}
          {!!product.weight && (
            <ProductChip
              boldText={`${product.weight} ${measurements.weight.options[product.weightUnit]?.name}`}
            />
          )}
        </View>
        {!!product.description && (
          <CollapsableText text={product.description} />
        )}
      </View>
      <Divider />
      <SectionHeader>Specifikation</SectionHeader>
      <View style={{ gap: 16 }}>
        <View style={{ gap: 4 }}>
          <Label size="medium">Varumärke</Label>
          <Body size="medium" isLink>
            {brand?.name}
          </Body>
        </View>
        <View style={{ gap: 4 }}>
          <Label size="medium">Antal och enhet</Label>
          <Body size="medium">
            {product.primaryQuantity}{" "}
            {product.primaryUnit ? quantities[product.primaryUnit].short : ""}
          </Body>
          {product.secondaryQuantity && (
            <Body size="medium">
              {product.secondaryQuantity}{" "}
              {product.secondaryUnit
                ? quantities[product.secondaryUnit].short
                : ""}
            </Body>
          )}
        </View>
        <View style={{ gap: 4 }}>
          <Label size="medium">Skick</Label>
          {product.condition && (
            <Body size="medium" isLink>
              {conditions[product.condition].name}
            </Body>
          )}
        </View>
        {showSpecificsMeasurements && (
          <View style={{ gap: 4 }}>
            <Label size="medium">Mått</Label>
            {!!product.width && (
              <Body size="medium">
                Bredd: {product.width}{" "}
                {measurements.width.options[product.widthUnit]?.name}
              </Body>
            )}
            {!!product.height && (
              <Body size="medium">
                Höjd: {product.height}{" "}
                {measurements.height.options[product.heightUnit]?.name}
              </Body>
            )}
            {!!product.thickness && (
              <Body size="medium">
                Djup: {product.thickness}{" "}
                {measurements.thickness.options[product.thicknessUnit]?.name}
              </Body>
            )}
            {!!product.length && (
              <Body size="medium">
                Längd: {product.length}{" "}
                {measurements.length.options[product.lengthUnit]?.name}
              </Body>
            )}
            {!!product.diameter && (
              <Body size="medium">
                Diameter: {product.diameter}{" "}
                {measurements.diameter.options[product.diameterUnit]?.name}
              </Body>
            )}
            {!!product.weight && (
              <Body size="medium">
                Vikt: {product.weight}{" "}
                {measurements.weight.options[product.weightUnit]?.name}
              </Body>
            )}
          </View>
        )}
        {product.color && (
          <View style={{ gap: 4 }}>
            <Label size="medium">Färg</Label>
            <Body size="medium">
              {colorTypes[product.colorType].text}: {product.color}
            </Body>
          </View>
        )}
        {showSpecificsDocuments && (
          <View style={{ gap: 4 }}>
            <Label size="medium">Dokument</Label>
            <View style={{ gap: 16 }}>
              {documents.map((document, i) => (
                <Pressable
                  onPress={() => Linking.openURL(document.url)}
                  key={i}
                >
                  <Body size="medium" isLink>
                    {document.name ?? "NO_NAME"}
                  </Body>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

type ProductChipProps = {
  boldText?: string;
};

const ProductChip = ({ boldText }: ProductChipProps) => {
  return (
    <FilterChip
      label={
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {boldText && <Label size="large">{boldText}</Label>}
        </View>
      }
    />
  );
};
