import { Category, File, Product, Project } from "@/gql/graphql";
import { FilterChip } from "@components/chips/filterChip";
import { Divider } from "@components/dividers/divider";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { conditions } from "@constants/conditions";
import { quantities } from "@constants/quantities";
import { Icon } from "@icons/icon";
import React, { useState } from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import * as Linking from "expo-linking";
import { measurements } from "@constants/measurements";
import { CollapsableText } from "@components/collapsable-text/collapsable-text";

type Props = {
  product: Omit<Partial<Product>, "category" | "seller" | "project">;
  project?: Pick<Project, "approximatePlace">;
  category?: Pick<Category, "id" | "name"> | null;
  parentCategory?: Pick<Category, "id" | "name"> | null;
  documents: File[];
  myAddress?: string | null;
};

export const MainContent = ({
  product,
  project,
  category,
  parentCategory,
  myAddress,
  documents,
}: Props) => {
  const [showSpecifics, setShowSpecifics] = useState(false);

  const approximatePlace = project
    ? project.approximatePlace
    : product.approximatePlace;

  return (
    <View style={{ gap: 24 }}>
      <View>
        <Title size="large">{product.title}</Title>
        <Body size="large" color="secondary">
          {product.primaryQuantity}{" "}
          {product.primaryUnit ? quantities[product.primaryUnit].short : ""} •{" "}
          {product.condition ? conditions[product.condition].name : ""}
        </Body>
      </View>
      <View>
        <Headline size="large" style={{ marginBottom: 8 }}>
          {product.price} kr
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
              • Hemtransport till{" "}
              <Body size="medium" isLink>
                {myAddress}
              </Body>{" "}
              från {product.deliveryPrice} kr
            </Body>
          )}
        </View>
      </View>
      <Divider />
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {product.primaryQuantity && product.primaryUnit && (
            <ProductChip
              text="Antal"
              boldText={`${product.primaryQuantity} ${quantities[product.primaryUnit].short}`}
            />
          )}
          {product.secondaryQuantity && product.secondaryUnit && (
            <ProductChip
              text="Antal"
              boldText={`${product.secondaryQuantity} ${quantities[product.secondaryUnit].short}`}
            />
          )}
          {product.condition && (
            <ProductChip
              text="Skick"
              boldText={conditions[product.condition].name}
            />
          )}
          {product.brand && <ProductChip boldText={product.brand.name} />}
          {!!product.thickness && (
            <ProductChip
              text={measurements["thickness"].name}
              boldText={`${product.thickness} mm`}
            />
          )}
          {!!product.height && (
            <ProductChip
              text={measurements["height"].name}
              boldText={`${product.height} mm`}
            />
          )}
          {!!product.width && (
            <ProductChip
              text={measurements["width"].name}
              boldText={`${product.width} mm`}
            />
          )}
          {!!product.length && (
            <ProductChip
              text={measurements["length"].name}
              boldText={`${product.length} mm`}
            />
          )}
          {!!product.diameter && (
            <ProductChip
              text={measurements["diameter"].name}
              boldText={`${product.diameter} mm`}
            />
          )}
          {!!product.weight && (
            <ProductChip
              text={measurements["weight"].name}
              boldText={`${product.weight} mm`}
            />
          )}
        </View>
        {!!product.description && (
          <CollapsableText text={product.description} />
        )}
      </View>
      <Divider />
      <Pressable onPress={() => setShowSpecifics(!showSpecifics)}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Headline size="small">Fullständig specifikation</Headline>
          <Icon icon={showSpecifics ? "chevronUp" : "chevronDown"} size={18} />
        </View>
      </Pressable>
      {showSpecifics && (
        <View style={{ gap: 16 }}>
          <View style={{ gap: 4 }}>
            <Label size="medium">Kategori</Label>
            <Body size="medium">
              <Body size="medium" isLink>
                {parentCategory?.name}
              </Body>
              ,
              <Body size="medium" isLink>
                {category?.name}
              </Body>
            </Body>
          </View>
          <View style={{ gap: 4 }}>
            <Label size="medium">Varumärke</Label>
            <Body size="medium" isLink>
              {product.brand?.name}
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
          <View style={{ gap: 4 }}>
            <Label size="medium">Mått</Label>
            {product.width && (
              <Body size="medium">Bredd: {product.width} mm</Body>
            )}
            {product.height && (
              <Body size="medium">Höjd: {product.height} mm</Body>
            )}
            {product.thickness && (
              <Body size="medium">Djup: {product.thickness} mm</Body>
            )}
            {product.length && (
              <Body size="medium">Längd: {product.length} mm</Body>
            )}
            {product.weight && (
              <Body size="medium">Vikt: {product.weight} kg</Body>
            )}
          </View>
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
        </View>
      )}
    </View>
  );
};

type ProductChipProps = {
  text?: string;
  boldText?: string;
};

const ProductChip = ({ text, boldText }: ProductChipProps) => {
  return (
    <FilterChip
      label={
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {text && <Body size="medium">{text}: </Body>}
          {boldText && <Label size="large">{boldText}</Label>}
        </View>
      }
    />
  );
};
