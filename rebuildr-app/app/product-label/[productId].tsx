import { View, Platform, Pressable } from "react-native";
import React, { useCallback } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { ProductLabelSheet } from "@components/product-label/product-label-sheet";
import { Body } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";

export default function PrintProductLabel() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const colors = useThemeColor();

  const handleReady = useCallback(() => {
    if (Platform.OS !== "web") return;
    window.onafterprint = () => {
      window.onafterprint = null;
      if (window.opener) window.close();
    };
    window.print();
  }, []);

  const handleClose = useCallback(() => {
    if (Platform.OS !== "web") return;
    if (window.opener) {
      window.close();
      return;
    }
    if (productId) {
      router.replace(`/product/${productId}`);
    } else {
      router.replace("/");
    }
  }, [productId]);

  if (!productId) return null;

  return (
    <>
      {Platform.OS === "web" && (
        <style>
          {`@page { size: A4; margin: 12px; }
            html, body { margin: 0; padding: 0; height: auto; }
            @media print {
              #product-label-close { display: none !important; }
            }`}
        </style>
      )}
      {Platform.OS === "web" && (
        <View
          nativeID="product-label-close"
          style={{
            position: "fixed" as "absolute",
            top: 12,
            right: 12,
            zIndex: 1000,
          }}
        >
          <Pressable
            onPress={handleClose}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: colors.background.primary,
              borderRadius: borderRadius.small,
              borderWidth: 1,
              borderColor: colors.dividers.neutral,
            }}
          >
            <Body size="medium">Stäng</Body>
          </Pressable>
        </View>
      )}
      <ProductLabelSheet productId={productId} onReady={handleReady} />
    </>
  );
}
