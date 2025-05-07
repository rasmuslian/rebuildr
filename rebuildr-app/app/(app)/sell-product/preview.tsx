import { PreviewProductQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { FilterChip } from "@components/chips/filterChip";
import { measurements } from "@components/create-product/measurements-section";
import { ProgressHeader } from "@components/create-product/progress-header";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { conditions } from "@constants/conditions";
import { quantities } from "@constants/quantities";
import { Icon } from "@icons/icon";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import * as Linking from "expo-linking";
import { Image } from "expo-image";
import { Map } from "@components/maps/map";
import { borderRadius } from "@constants/sizes";
import { BottomSheet } from "@components/bottom-sheet/bottom-sheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Button } from "@components/buttons/button";

const PREVIEW_PRODUCT = gql`
  query PreviewProduct {
    getDraftedProduct {
      id
      title
      description
      price
      isGiveaway
      condition
      primaryQuantity
      primaryUnit
      secondaryQuantity
      secondaryUnit
      height
      width
      length
      thickness
      diameter
      weight
      images {
        id
        mimeType
        url
        name
      }
      documents {
        id
        mimeType
        url
        name
      }
      category {
        id
        name
        hasChildren
        ancestorIds
        parent {
          id
          name
        }
      }
      brand {
        id
        name
        type
      }
      location {
        lat
        lng
      }
      approximatePlace {
        lat
        lng
        address
      }
      project {
        id
        title
        address
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
      pickupEnabled
      deliveryRadius
      deliveryPrice
      deliveryEnabled
      shippingPrices {
        id
        maxWeight
        price
        provider
      }
    }
    me {
      id
      address
    }
  }
`;

export default function Preview() {
  const [showAllDescription, setShowAllDescription] = useState(false);
  const [showSpecifics, setShowSpecifics] = useState(true);
  const imageRef = useRef<BottomSheetModal>(null);
  const mapRef = useRef<BottomSheetModal>(null);
  const { data } = useQuery<PreviewProductQuery>(PREVIEW_PRODUCT);

  if (!data) {
    return <LoadingSpinner />;
  }
  if (!data.getDraftedProduct) {
    router.replace("/");
    return null;
  }

  const product = data.getDraftedProduct;
  const project = product?.project;
  const approximatePlace = project
    ? project.approximatePlace
    : data.getDraftedProduct.approximatePlace;

  return (
    <>
      <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
        <ProgressHeader
          onClose={() =>
            router.canDismiss() ? router.dismiss() : router.replace("/")
          }
          title="Ny annons"
          prog3={100}
        />
      </View>
      <ScreenLayout
        style={{ gap: 24 }}
        footerComponent={
          <View
            style={{
              gap: 8,
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: "row",
              paddingTop: 24,
            }}
          >
            <Button
              icon="arrowLeft"
              label="Tillbaka"
              onPress={() =>
                router.navigate("/(app)/sell-product/transportation")
              }
            />
            <Button
              label="Publicera annons"
              onPress={() => {}}
              style={{ flex: 1 }}
            />
          </View>
        }
      >
        <Pressable
          onPress={() => {
            imageRef.current?.present();
          }}
        >
          <Image
            source={data.getDraftedProduct.images[0].url}
            style={{ height: 383, borderRadius: borderRadius.medium }}
          />
        </Pressable>
        <View>
          <Title size="large">{product?.title}</Title>
          <Body size="large" color="secondary">
            {product?.primaryQuantity}{" "}
            {product?.primaryUnit ? quantities[product.primaryUnit].short : ""}{" "}
            • {product?.condition ? conditions[product.condition].name : ""}
          </Body>
        </View>
        <View>
          <Headline size="large" style={{ marginBottom: 8 }}>
            {product?.price} kr
          </Headline>
          <View style={{ gap: 2 }}>
            {product?.pickupEnabled && (
              <Body size="medium" color="secondary">
                • Hämta själv:{" "}
                <Body size="medium" isLink>
                  {approximatePlace?.address}
                </Body>
              </Body>
            )}
            {!!product?.shippingPrices?.length && (
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
            {product?.deliveryEnabled && (
              <Body size="medium" color="secondary">
                • Hemtransport till{" "}
                <Body size="medium" isLink>
                  {data.me.address}
                </Body>{" "}
                från {product.deliveryPrice} kr
              </Body>
            )}
          </View>
        </View>
        <Divider />
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {product?.primaryQuantity && product.primaryUnit && (
              <ProductChip
                text="Antal"
                boldText={`${product.primaryQuantity} ${quantities[product.primaryUnit].short}`}
              />
            )}
            {product?.secondaryQuantity && product.secondaryUnit && (
              <ProductChip
                text="Antal"
                boldText={`${product.secondaryQuantity} ${quantities[product.secondaryUnit].short}`}
              />
            )}
            {product?.condition && (
              <ProductChip
                text="Skick"
                boldText={conditions[product.condition].name}
              />
            )}
            {product?.brand && <ProductChip boldText={product.brand.name} />}
            {product?.thickness && (
              <ProductChip
                text={measurements["thickness"].name}
                boldText={`${product.thickness} mm`}
              />
            )}
            {product?.height && (
              <ProductChip
                text={measurements["height"].name}
                boldText={`${product.height} mm`}
              />
            )}
            {product?.width && (
              <ProductChip
                text={measurements["width"].name}
                boldText={`${product.width} mm`}
              />
            )}
            {product?.length && (
              <ProductChip
                text={measurements["length"].name}
                boldText={`${product.length} mm`}
              />
            )}
            {product?.diameter && (
              <ProductChip
                text={measurements["diameter"].name}
                boldText={`${product.diameter} mm`}
              />
            )}
            {product?.weight && (
              <ProductChip
                text={measurements["weight"].name}
                boldText={`${product.weight} mm`}
              />
            )}
          </View>
          <Body
            size="medium"
            numberOfLines={showAllDescription ? undefined : 7}
            ellipsizeMode="tail"
          >
            {product?.description}
          </Body>
          {product?.description && product.description.length > 350 && (
            <Pressable onPress={() => setShowAllDescription(true)}>
              <Body size="medium" isLink>
                Läs hela beskrivningen
              </Body>
            </Pressable>
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
            <Icon icon="chevronUp" size={18} />
          </View>
        </Pressable>
        {showSpecifics && (
          <View style={{ gap: 16 }}>
            <View style={{ gap: 4 }}>
              <Label size="medium">Kategori</Label>
              <Body size="medium">
                <Body size="medium" isLink>
                  {data.getDraftedProduct.category?.parent?.name}
                </Body>
                ,
                <Body size="medium" isLink>
                  {data.getDraftedProduct.category?.name}
                </Body>
              </Body>
            </View>
            <View style={{ gap: 4 }}>
              <Label size="medium">Varumärke</Label>
              <Body size="medium" isLink>
                {data.getDraftedProduct.brand?.name}
              </Body>
            </View>
            <View style={{ gap: 4 }}>
              <Label size="medium">Antal och enhet</Label>
              <Body size="medium">
                {data.getDraftedProduct.primaryQuantity}{" "}
                {data.getDraftedProduct.primaryUnit
                  ? quantities[data.getDraftedProduct.primaryUnit].short
                  : ""}
              </Body>
              {data.getDraftedProduct.secondaryQuantity && (
                <Body size="medium">
                  {data.getDraftedProduct.secondaryQuantity}{" "}
                  {data.getDraftedProduct.secondaryUnit
                    ? quantities[data.getDraftedProduct.secondaryUnit].short
                    : ""}
                </Body>
              )}
            </View>
            <View style={{ gap: 4 }}>
              <Label size="medium">Skick</Label>
              {data.getDraftedProduct.condition && (
                <Body size="medium" isLink>
                  {conditions[data.getDraftedProduct.condition].name}
                </Body>
              )}
            </View>
            <View style={{ gap: 4 }}>
              <Label size="medium">Mått</Label>
              {data.getDraftedProduct.width && (
                <Body size="medium">
                  Bredd: {data.getDraftedProduct.width} mm
                </Body>
              )}
              {data.getDraftedProduct.height && (
                <Body size="medium">
                  Höjd: {data.getDraftedProduct.height} mm
                </Body>
              )}
              {data.getDraftedProduct.thickness && (
                <Body size="medium">
                  Djup: {data.getDraftedProduct.thickness} mm
                </Body>
              )}
              {data.getDraftedProduct.length && (
                <Body size="medium">
                  Längd: {data.getDraftedProduct.length} mm
                </Body>
              )}
              {data.getDraftedProduct.weight && (
                <Body size="medium">
                  Vikt: {data.getDraftedProduct.weight} kg
                </Body>
              )}
            </View>
            <View style={{ gap: 4 }}>
              <Label size="medium">Dokument</Label>
              <View style={{ gap: 16 }}>
                {data.getDraftedProduct.documents.map((document, i) => (
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
        <Divider />
        <View>
          <Headline size="small">Alla bilder</Headline>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 16,
            }}
          >
            {data.getDraftedProduct.images.map((image, i) => (
              <Image
                key={i}
                source={image.url}
                style={{ minWidth: 110, height: 109 }}
              />
            ))}
          </View>
        </View>
        {approximatePlace && (
          <>
            <Divider />
            <View>
              <Headline size="small" style={{ marginBottom: 16 }}>
                Plats för avhämtning
              </Headline>
              <Pressable onPress={() => mapRef.current?.present()}>
                <Map
                  lat={approximatePlace.lat}
                  lng={approximatePlace.lng}
                  interactive={false}
                  radius={5000}
                  zoom={10}
                />
              </Pressable>
              <Body size="medium" style={{ marginTop: 16, marginBottom: 12 }}>
                {approximatePlace.address}
              </Body>
              <Body size="small" color="secondary">
                Ungefärligt område. Adress visas först när ett köp har
                genomförts.
              </Body>
            </View>
          </>
        )}
      </ScreenLayout>
      <BottomSheet
        ref={imageRef}
        name="images"
        title="Alla bilder"
        scrollable
        screenHeight
      >
        <View style={{ gap: 16, marginTop: 16, flex: 1, height: "100%" }}>
          {data.getDraftedProduct.images.map((image, i) => (
            <Image key={i} source={image.url} style={{ minHeight: 230 }} />
          ))}
        </View>
      </BottomSheet>
      <BottomSheet ref={mapRef} name="map" title="Plats för avhämtning">
        <View style={{ marginTop: 16 }}>
          {approximatePlace ? (
            <Map
              lat={approximatePlace.lat}
              lng={approximatePlace.lng}
              interactive={false}
              radius={5000}
              height={700}
            />
          ) : null}
        </View>
      </BottomSheet>
    </>
  );
}

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
