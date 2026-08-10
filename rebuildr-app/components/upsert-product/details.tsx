import { Pressable, View } from "react-native";
import { Toggle } from "@components/controls/toggle";
import { Form } from "@components/forms/form";
import { BrandSection } from "@components/product/brand-section";
import { CategorySection } from "@components/product/category-section";
import { ConditionSection } from "@components/product/condition-section";
import { DescriptionSection } from "@components/product/description-section";
import { DocumentSection } from "@components/product/document-section";
import { ImageSection } from "@components/product/image-section";
import { MeasurementsSection } from "@components/product/measurements-section";
import { PriceSection } from "@components/product/price-section";
import { QuantitiesSection } from "@components/product/quantities-section";
import { RootCategorySection } from "@components/product/root-category-section";
import { CategorySummaryRow } from "@components/product/category-summary-row";
import { Body, Label, Title } from "@components/typography/text";
import { useEffect, useRef, useState } from "react";
import { Button } from "@components/buttons/button";
import { AnalyzeProgress } from "./analyze-progress";
import { useThemeColor } from "@hooks/useThemeColor";
import { borderRadius } from "@constants/sizes";
import { ProductFields } from "./types";
import { useScreenType } from "@hooks/useScreenType";
import { ColorSection } from "@components/product/color-section";
import {
  MeasurementTypeEnum,
  MeasurementUnitEnum,
  QuantityUnitEnum,
} from "@/gql/graphql";
import { AdditionalInfoSection } from "@components/product/additional-info-section";
import { CO2Section } from "@components/product/co2-section";
import { primitives } from "@constants/colors";
import { AvailabilitySection } from "./availability-section";

type Props = {
  product: ProductFields;
  update: (product: Partial<ProductFields>) => void;
  onNext: () => void;
  badFields?: { [key: string]: string };
  onAnalyzeImages: () => Promise<void>;
  imageAnalyzeLoading: boolean;
  imageAnalyzeError?: boolean;
  internalMode?: boolean;
  nextLabel?: string;
  onDelete?: () => void;
  compact?: boolean;
};

export const Details = ({
  product,
  update,
  onNext,
  badFields,
  onAnalyzeImages,
  imageAnalyzeLoading,
  imageAnalyzeError,
  internalMode,
  nextLabel,
  onDelete,
  compact = false,
}: Props) => {
  const { isDesktop } = useScreenType();
  const colors = useThemeColor();

  //Track the AI analysis lifecycle to show the right banner state.
  //`hasSuggestions` latches true after the first successful run (or starts true
  //for a resumed draft that already has content). A later re-run that fails —
  //e.g. a transient AI error when another image is added — then keeps the
  //suggestions we already have instead of flipping to the "failed, fill in
  //manually" banner. This also keeps the two banners mutually exclusive.
  const [hasSuggestions, setHasSuggestions] = useState(
    () => !!product.title || !!product.description,
  );
  const prevAnalyzeLoading = useRef(false);
  useEffect(() => {
    if (
      prevAnalyzeLoading.current &&
      !imageAnalyzeLoading &&
      !imageAnalyzeError
    ) {
      setHasSuggestions(true);
    }
    prevAnalyzeLoading.current = imageAnalyzeLoading;
  }, [imageAnalyzeLoading, imageAnalyzeError]);

  const [showDetails, setShowDetails] = useState(() => {
    if (compact) return false;
    const measurementSet = (
      ["thickness", "height", "width", "length", "diameter"] as const
    ).some((measurementKey) => !!product[measurementKey]);

    //show details if any measurements are set or any documents are chosen
    return (
      measurementSet ||
      !!product.documents?.length ||
      !!product.color ||
      !!product.additionalInfo
    );
  });
  const hasImages = !!product.images?.length;
  const rootCategoryId = product.categoryIds?.[0];
  const categoryId = product.categoryIds?.[1];
  const showContinue =
    rootCategoryId && categoryId && (internalMode || product.brandId);

  return (
    <View
      style={{
        gap: compact ? 12 : 24,
        marginTop: compact ? 12 : 24,
        paddingBottom: isDesktop && !showContinue ? 32 : 0,
      }}
    >
      {!compact && (
        <Body size="large">
          Börja med bilderna, så ger AI förslag på din annons. Ändra fritt innan
          du publicerar.
        </Body>
      )}
      <ImageSection
        compact={compact}
        images={product.images ?? []}
        imageError={badFields?.["images"]}
        onUpdateImages={(images) => {
          update({ ...product, images });
        }}
      />
      {/* Start minimal: nothing else until the first image is added */}
      {hasImages && imageAnalyzeLoading && <AnalyzeProgress />}
      {!compact && hasSuggestions && !imageAnalyzeLoading && (
        <View
          style={{
            backgroundColor: colors.buttons.tonal.enabled,
            borderRadius: borderRadius.medium,
            padding: 16,
          }}
        >
          <Label size="medium">✓ AI-förslag ifyllda</Label>
          <Body size="small" color="secondary">
            Granska och justera fälten nedan — särskilt mängd, mått och pris —
            innan du går vidare.
          </Body>
          {imageAnalyzeError && (
            <Body size="small" color="secondary" style={{ marginTop: 8 }}>
              Kunde inte uppdatera förslaget med den senaste bilden — tidigare
              förslag står kvar.
            </Body>
          )}
        </View>
      )}
      {!compact &&
        imageAnalyzeError &&
        !imageAnalyzeLoading &&
        !hasSuggestions && (
          <View
            style={{
              backgroundColor: colors.buttons.tonal.enabled,
              borderRadius: borderRadius.medium,
              padding: 16,
              gap: 8,
            }}
          >
            <Label size="medium">AI-förslaget misslyckades</Label>
            <Body size="small" color="secondary">
              Fyll i fälten manuellt, eller{" "}
              <Body size="small" isLink onPress={() => onAnalyzeImages()}>
                försök igen
              </Body>
              .
            </Body>
          </View>
        )}
      {/* Category: one compact row when chosen (the normal case after AI),
          full pickers only while choosing — and never while the AI is still
          analyzing (it usually picks the category itself) */}
      {(hasImages || compact) &&
        !imageAnalyzeLoading &&
        (categoryId ? (
          <CategorySummaryRow
            compact={compact}
            categoryId={categoryId}
            onChange={() => update({ ...product, categoryIds: [] })}
          />
        ) : (
          <>
            <RootCategorySection
              compact={compact}
              onSelect={(id) => {
                update({ ...product, categoryIds: [id] });
              }}
              selectedId={product.categoryIds?.[0]}
              onChange={() => {
                update({ ...product, categoryIds: [] });
              }}
            />
            {rootCategoryId && (
              <CategorySection
                compact={compact}
                parentId={rootCategoryId}
                onSelect={(id) =>
                  update({
                    categoryIds: [...(product.categoryIds ?? []), id],
                  })
                }
                selectedId={product.categoryIds?.[1]}
                onChange={() =>
                  update({ ...product, categoryIds: [rootCategoryId] })
                }
              />
            )}
          </>
        ))}
      {(hasImages || compact) && categoryId && (
        <>
          {!internalMode && (
            <PriceSection
              price={product.price}
              minimumPrice={product.minimumPrice ?? 0}
              priceError={badFields?.["price"]}
              isGiveaway={!!product.isGiveaway}
              onUpdate={(isGiveaway, price) => update({ isGiveaway, price })}
              soldByQuantity={!!product.soldByQuantity}
              onUpdateSoldByQuantity={(soldByQuantity) =>
                update({ soldByQuantity, price: undefined })
              }
              priceSuggestionMin={product.priceSuggestionMin}
              priceSuggestionMax={product.priceSuggestionMax}
            />
          )}
          <DescriptionSection
            compact={compact}
            product={product}
            titleError={badFields?.["title"]}
            descriptionError={badFields?.["description"]}
            onChangeTitle={(title) => update({ title })}
            onChangeDescription={(description) => update({ description })}
          />
          {internalMode && (
            <Form
              fields={[
                {
                  type: "text",
                  value: product.internalReferenceNumber ?? "",
                  onChangeText: (internalReferenceNumber) =>
                    update({ internalReferenceNumber }),
                  heading: "Internt id/referensnummer",
                  description: "Valfritt. Visas bara för interna annonser.",
                  placeholder: "Till exempel INV-12345",
                },
              ]}
            />
          )}
          <QuantitiesSection
            compact={compact}
            categoryId={categoryId}
            primaryQuantity={product.primaryQuantity}
            primaryUnit={product.primaryUnit}
            primaryError={badFields?.["primary"]}
            onChangePrimary={({ quantity, unit }) => {
              let updateArguments: Partial<ProductFields> = {
                primaryQuantity: quantity,
                primaryUnit: unit,
              };
              //If we are going from kg to something else
              if (
                product.primaryUnit === QuantityUnitEnum.Kg &&
                unit !== QuantityUnitEnum.Kg
              ) {
                //reset weight. This is because weight is controlled by primaryQuantity if primaryUnit is kg
                updateArguments = { ...updateArguments, weight: 0 };
              }
              update(updateArguments);
            }}
            secondaryQuantity={product.secondaryQuantity}
            secondaryUnit={product.secondaryUnit}
            onChangeSecondary={({ quantity, unit }) =>
              update({
                secondaryQuantity: quantity,
                secondaryUnit: unit,
              })
            }
          />
          <ConditionSection
            compact={compact}
            condition={product.condition}
            onSelect={(condition) => update({ condition })}
          />
          <BrandSection
            categoryId={categoryId}
            onSelect={(brandId) => update({ brandId })}
            brandId={product.brandId}
          />
        </>
      )}
      {(hasImages || compact) && categoryId && (
        <>
          <CO2Section
            compact={compact}
            product={product}
            onChange={(w) => {
              update({ weight: w, weightUnit: MeasurementUnitEnum.Kg });
            }}
          />
          {internalMode && (
            <AvailabilitySection
              product={product}
              update={update}
              error={badFields?.["availability"]}
            />
          )}
          <Pressable onPress={() => setShowDetails(!showDetails)}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                paddingVertical: compact ? 4 : 0,
              }}
            >
              <View style={{ flex: 1 }}>
                <Title size={compact ? "small" : "medium"}>
                  Lägg till fler produktdetaljer
                </Title>
                {!compact && (
                  <Body size="medium">
                    Lägg till specifik info avseende mått, färg, dokument eller
                    bra för köpare att veta
                  </Body>
                )}
              </View>
              <Toggle
                value={showDetails}
                onPress={() => setShowDetails(!showDetails)}
              />
            </View>
          </Pressable>
          {showDetails && product.categoryIds?.[1] && (
            <>
              <View style={{ zIndex: 2 }}>
                <MeasurementsSection
                  compact={compact}
                  categoryId={product.categoryIds[1]}
                  value={{
                    THICKNESS:
                      product.thickness !== undefined
                        ? {
                            value: product.thickness,
                            unit: product.thicknessUnit,
                          }
                        : undefined,
                    HEIGHT:
                      product.height !== undefined
                        ? { value: product.height, unit: product.heightUnit }
                        : undefined,
                    WIDTH:
                      product.width !== undefined
                        ? { value: product.width, unit: product.widthUnit }
                        : undefined,
                    LENGTH:
                      product.length !== undefined
                        ? { value: product.length, unit: product.lengthUnit }
                        : undefined,
                    DIAMETER:
                      product.diameter !== undefined
                        ? {
                            value: product.diameter,
                            unit: product.diameterUnit,
                          }
                        : undefined,
                    WEIGHT:
                      product.weight !== undefined
                        ? { value: product.weight, unit: product.weightUnit }
                        : undefined,
                  }}
                  onChange={(measurementType, value, unit) => {
                    switch (measurementType) {
                      case MeasurementTypeEnum.Thickness:
                        update({ thickness: value, thicknessUnit: unit });
                        break;
                      case MeasurementTypeEnum.Height:
                        update({ height: value, heightUnit: unit });
                        break;
                      case MeasurementTypeEnum.Width:
                        update({ width: value, widthUnit: unit });
                        break;
                      case MeasurementTypeEnum.Length:
                        update({ length: value, lengthUnit: unit });
                        break;
                      case MeasurementTypeEnum.Diameter:
                        update({ diameter: value, diameterUnit: unit });
                        break;
                      case MeasurementTypeEnum.Weight:
                        update({ weight: value, weightUnit: unit });
                        break;
                    }
                  }}
                />
              </View>
              <View
                style={{
                  zIndex: 1 /**zIndex required to make SelectInput inside ColorSelection render above DocumentSection */,
                }}
              >
                <ColorSection
                  color={product.color}
                  type={product.colorType}
                  onChange={(color, type) => update({ color, colorType: type })}
                />
              </View>
              <AdditionalInfoSection
                additionalInfo={product.additionalInfo ?? ""}
                onChange={(additionalInfo) => update({ additionalInfo })}
              />
              <DocumentSection
                compact={compact}
                documents={product.documents ?? []}
                onUpdateFiles={(files) => update({ documents: files })}
              />
            </>
          )}
        </>
      )}
      {showContinue && (
        <View
          style={[
            {
              backgroundColor:
                compact && isDesktop ? colors.background.neutral : undefined,
            },
            isDesktop && {
              position: "sticky",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              marginHorizontal: compact ? -12 : 0,
            },
          ]}
        >
          <View
            style={{
              gap: 6,
              backgroundColor: compact ? primitives.accent100 : undefined,
              paddingHorizontal: compact ? 12 : 0,
              paddingTop: compact ? 12 : 0,
              paddingBottom: compact ? 12 : 32,
              borderBottomLeftRadius: compact ? borderRadius.medium : 0,
              borderBottomRightRadius: compact ? borderRadius.medium : 0,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: onDelete ? "row" : "column",
                gap: 12,
                marginTop: compact ? 0 : 24,
              }}
            >
              <Button
                label={nextLabel ?? "Fortsätt"}
                type={compact && onDelete ? "tonal" : undefined}
                onPress={onNext}
                style={{
                  width: onDelete ? undefined : "100%",
                  flex: onDelete ? 1 : undefined,
                  ...(compact && onDelete
                    ? { backgroundColor: primitives.accent200 }
                    : {}),
                }}
              />
              {onDelete && (
                <Button
                  label="Ta bort"
                  type="outlined"
                  onPress={onDelete}
                  style={{ flex: 1 }}
                />
              )}
            </View>
            {badFields && !!Object.keys(badFields).length && (
              <View style={{ gap: 4 }}>
                {Object.keys(badFields).map((bf, i) => {
                  return (
                    <Body key={i} color="error" size="small">
                      {badFields[bf]}
                    </Body>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};
