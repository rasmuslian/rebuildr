import React, { useState } from "react";
import { View } from "react-native";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { gql, useMutation, useQuery } from "@apollo/client";
import { launchImageLibraryAsync } from "expo-image-picker";
import { getDocumentAsync } from "expo-document-picker";
import {
  InternalInventoryQuery,
  InternalInventoryQueryVariables,
  AiImportInventoryMutation,
  AiImportInventoryMutationVariables,
  AiImportInventoryDocumentMutation,
  AiImportInventoryDocumentMutationVariables,
  ProductVisibilityEnum,
} from "@/gql/graphql";
import { useScreenType } from "@hooks/useScreenType";
import TopBar from "@components/navigation/top-bar/top-bar";
import { AdGridSection } from "@components/ad-grid-section/ad-grid-section";
import { ProductEmptyState } from "@components/profile/product-empty-state";
import { Button } from "@components/buttons/button";
import { Body } from "@components/typography/text";

export const INTERNAL_INVENTORY = gql`
  query InternalInventory($input: ProductsInput!, $limit: Int, $offset: Int) {
    products(input: $input, limit: $limit, offset: $offset) {
      products {
        id
        status
        title
        price
        soldByQuantity
        condition
        primaryQuantity
        primaryUnit
        primaryImage {
          id
          url
        }
        approximatePlace {
          address
        }
        seller {
          id
          rating
          type
        }
      }
      total
    }
  }
`;

const AI_IMPORT_INVENTORY = gql`
  mutation AiImportInventory($images: [String!]!) {
    aiImportInventoryImages(images: $images) {
      id
    }
  }
`;

const AI_IMPORT_INVENTORY_DOCUMENT = gql`
  mutation AiImportInventoryDocument($file: String!, $mimeType: String!) {
    aiImportInventoryDocument(file: $file, mimeType: $mimeType) {
      id
    }
  }
`;

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
};

export default function InternalInventory() {
  const PRODUCTS_PER_PAGE = 10;
  const { isDesktop } = useScreenType();
  const [message, setMessage] = useState<string | null>(null);

  const { data, loading, fetchMore, refetch } = useQuery<
    InternalInventoryQuery,
    InternalInventoryQueryVariables
  >(INTERNAL_INVENTORY, {
    variables: {
      // Backend scopes INTERNAL listings to the current user's company.
      input: { visibility: ProductVisibilityEnum.Internal },
      limit: PRODUCTS_PER_PAGE,
      offset: 0,
    },
  });

  const [aiImport, { loading: importing }] = useMutation<
    AiImportInventoryMutation,
    AiImportInventoryMutationVariables
  >(AI_IMPORT_INVENTORY);

  const [aiImportDoc, { loading: importingDoc }] = useMutation<
    AiImportInventoryDocumentMutation,
    AiImportInventoryDocumentMutationVariables
  >(AI_IMPORT_INVENTORY_DOCUMENT);

  const onImport = async () => {
    setMessage(null);
    const result = await launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      base64: true,
    });
    if (result.canceled || !result.assets?.length) return;

    const images = result.assets
      .map((a) => a.base64)
      .filter((b): b is string => !!b);
    if (!images.length) return;

    try {
      const res = await aiImport({ variables: { images } });
      const count = res.data?.aiImportInventoryImages.length ?? 0;
      setMessage(`AI skapade ${count} annons(er) i internlagret.`);
      await refetch();
    } catch (e) {
      setMessage("Importen misslyckades. Försök igen.");
    }
  };

  const onImportList = async () => {
    setMessage(null);
    const result = await getDocumentAsync({
      type: [
        "text/csv",
        "text/plain",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];

    let file = "";
    try {
      const buffer = await (await fetch(asset.uri)).arrayBuffer();
      file = arrayBufferToBase64(buffer);
    } catch {
      setMessage("Kunde inte läsa filen.");
      return;
    }
    if (!file) return;

    try {
      const res = await aiImportDoc({
        variables: {
          file,
          mimeType: asset.mimeType ?? "text/csv",
        },
      });
      const count = res.data?.aiImportInventoryDocument.length ?? 0;
      setMessage(`AI skapade ${count} annons(er) från listan.`);
      await refetch();
    } catch {
      setMessage("Importen misslyckades. Försök igen.");
    }
  };

  const onShowMore = async () => {
    await fetchMore({
      variables: {
        limit: PRODUCTS_PER_PAGE,
        offset: Math.ceil(
          (data?.products.products?.length ?? 0) / PRODUCTS_PER_PAGE,
        ),
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.products?.products.length) return prev;
        return {
          products: {
            ...prev.products,
            ...fetchMoreResult.products,
            products: [
              ...prev.products.products,
              ...fetchMoreResult.products.products,
            ],
          },
        };
      },
    });
  };

  const products = data?.products.products ?? [];
  const numberOfProducts = data?.products.total ?? 0;

  return (
    <ScreenLayout
      headerComponent={
        isDesktop ? <TopBar theme="light" /> : <Header title="Internt lager" />
      }
      loading={loading}
    >
      <View style={{ gap: 16 }}>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Button
              label="Importera lista (CSV/Excel)"
              onPress={onImportList}
              loading={importingDoc}
            />
            <Button
              label="Importera foton (AI)"
              type="tonal"
              onPress={onImport}
              loading={importing}
            />
          </View>
          <Body size="small">
            Ladda upp en produktlista (CSV) eller foton — AI skapar interna
            annonser med genererade bilder. Kommande inleveranser blir
            automatiskt "kommande" annonser.
          </Body>
          {message ? <Body size="small">{message}</Body> : null}
        </View>

        {numberOfProducts > 0 ? (
          <AdGridSection
            header={isDesktop ? "Internt lager" : undefined}
            products={products.map((product) => ({
              id: product.id,
              status: product.status,
              imageUri: product.primaryImage?.url,
              title: product.title,
              quantity: product.primaryQuantity,
              quantityUnit: product.primaryUnit,
              condition: product.condition,
              account: {
                rating: product.seller.rating,
                type: product.seller.type,
                location: product.approximatePlace?.address,
              },
              price: product.price,
              soldByQuantity: product.soldByQuantity,
              heart: false,
              liked: false,
            }))}
            pagination={{
              onShowMore,
              loading,
              total: numberOfProducts,
            }}
          />
        ) : (
          <ProductEmptyState sellerIsMe />
        )}
      </View>
    </ScreenLayout>
  );
}
