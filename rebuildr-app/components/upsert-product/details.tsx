import { View } from "react-native";
import { Toggle } from "@components/controls/toggle";
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
import { Title, Body, Label } from "@components/typography/text";
import { useEffect, useRef, useState } from "react";
import { Button } from "@components/buttons/button";
import { TextInput } from "@components/forms/textInput";
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
  ProductAvailabilityEnum,
  ProductAvailabilityPrecisionEnum,
} from "@/gql/graphql";
import { AdditionalInfoSection } from "@components/product/additional-info-section";
import { CO2Section } from "@components/product/co2-section";

type Props = {
  product: ProductFields;
  update: (product: Partial<ProductFields>) => void;
  onNext: () => void;
  badFields?: { [key: string]: string };
  onAnalyzeImages: () => Promise<void>;
  imageAnalyzeLoading: boolean;
  imageAnalyzeError?: boolean;
};

export const Details = ({
  product,
  update,
  onNext,
  badFields,
  onAnalyzeImages,
  imageAnalyzeLoading,
  imageAnalyzeError,
}: Props) => {
  const { isDesktop } = useScreenType();
  const colors = useThemeColor();

  // --- "kommande" availability inputs ---
  const precision =
    product.availabilityPrecision ?? ProductAvailabilityPrecisionEnum.Exact;
  const estDate = product.estimatedAvailableAt
    ? new Date(product.estimatedAvailableAt)
    : null;
  const [dateText, setDateText] = useState(
    product.estimatedAvailableAt &&
      precision !== ProductAvailabilityPrecisionEnum.Quarter
      ? product.estimatedAvailableAt.slice(
          0,
          precision === ProductAvailabilityPrecisionEnum.Month ? 7 : 10,
        )
      : "",
  );
  const [quarter, setQuarter] = useState<number | undefined>(
    estDate ? Math.floor(estDate.getMonth() / 3) + 1 : undefined,
  );
  const [qYear, setQYear] = useState(
    estDate ? String(estDate.getFullYear()) : "",
  );

  const choosePrecision = (p: ProductAvailabilityPrecisionEnum) => {
    if (p === ProductAvailabilityPrecisionEnum.Unknown) {
      update({ availabilityPrecision: p, estimatedAvailableAt: null });
    } else {
      update({ availabilityPrecision: p });
    }
  };

  const onDateChange = (t: string) => {
    setDateText(t);
    const d = new Date(t);
    update({
      estimatedAvailableAt: t && !isNaN(d.getTime()) ? d.toISOString() : null,
    });
  };

  const applyQuarter = (q?: number, year?: string) => {
    if (q && year && /^\d{4}$/.test(year)) {
      const month = String((q - 1) * 3 + 1).padStart(2, "0");
      update({ estimatedAvailableAt: `${year}-${month}-01` });
    } else {
      update({ estimatedAvailableAt: null });
    }
  };

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
  const showContinue = rootCategoryId && categoryId && product.brandId;

  return (
    <View
      style={{
        gap: 24,
        marginTop: 24,
        paddingBottom: isDesktop && !showContinue ? 32 : 0,
      }}
    >
      <View style={{ gap: 8 }}>
        <Body size="large">Börja med bilder — vi fyller i resten åt dig.</Body>
        <ImageSection
          images={product.images ?? []}
          imageError={badFields?.["images"]}
          onUpdateImages={(images) => {
            update({ ...product, images });
          }}
        />
      </View>
      {/* Start minimal: nothing else until the first image is added */}
      {hasImages && imageAnalyzeLoading && <AnalyzeProgress />}
      {hasSuggestions && !imageAnalyzeLoading && (
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
      {imageAnalyzeError && !imageAnalyzeLoading && !hasSuggestions && (
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
      {hasImages &&
        !imageAnalyzeLoading &&
        (categoryId ? (
          <CategorySummaryRow
            categoryId={categoryId}
            onChange={() => update({ ...product, categoryIds: [] })}
          />
        ) : (
          <>
            <RootCategorySection
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
      {hasImages && categoryId && (
        <>
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
          <DescriptionSection
            product={product}
            titleError={badFields?.["title"]}
            descriptionError={badFields?.["description"]}
            onChangeTitle={(title) => update({ title })}
            onChangeDescription={(description) => update({ description })}
          />
          <QuantitiesSection
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
          <CO2Section
            product={product}
            onChange={(w) => {
              update({ weight: w, weightUnit: MeasurementUnitEnum.Kg });
            }}
          />
          <View style={{ gap: 8 }}>
            <Label size="medium">Tillgänglighet</Label>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button
                label="Tillgänglig nu"
                style={{ flex: 1 }}
                type={
                  product.availability === ProductAvailabilityEnum.Upcoming
                    ? "tonal"
                    : "filled"
                }
                onPress={() =>
                  update({
                    availability: ProductAvailabilityEnum.Available,
                    estimatedAvailableAt: null,
                  })
                }
              />
              <Button
                label="Kommande"
                style={{ flex: 1 }}
                type={
                  product.availability === ProductAvailabilityEnum.Upcoming
                    ? "filled"
                    : "tonal"
                }
                onPress={() =>
                  update({ availability: ProductAvailabilityEnum.Upcoming })
                }
              />
            </View>
            {product.availability === ProductAvailabilityEnum.Upcoming && (
              <View style={{ gap: 8 }}>
                <Body size="small">När blir den tillgänglig?</Body>
                <View
                  style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                >
                  {[
                    {
                      value: ProductAvailabilityPrecisionEnum.Exact,
                      label: "Exakt datum",
                    },
                    {
                      value: ProductAvailabilityPrecisionEnum.Month,
                      label: "Månad",
                    },
                    {
                      value: ProductAvailabilityPrecisionEnum.Quarter,
                      label: "Kvartal",
                    },
                    {
                      value: ProductAvailabilityPrecisionEnum.Unknown,
                      label: "Vet ej",
                    },
                  ].map(({ value, label }) => (
                    <Button
                      key={value}
                      label={label}
                      type={precision === value ? "filled" : "tonal"}
                      onPress={() => choosePrecision(value)}
                    />
                  ))}
                </View>

                {precision === ProductAvailabilityPrecisionEnum.Exact && (
                  <TextInput
                    placeholder="ÅÅÅÅ-MM-DD"
                    value={dateText}
                    onChange={onDateChange}
                  />
                )}
                {precision === ProductAvailabilityPrecisionEnum.Month && (
                  <TextInput
                    placeholder="ÅÅÅÅ-MM"
                    value={dateText}
                    onChange={onDateChange}
                  />
                )}
                {precision === ProductAvailabilityPrecisionEnum.Quarter && (
                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {[1, 2, 3, 4].map((q) => (
                        <Button
                          key={q}
                          label={`Q${q}`}
                          style={{ flex: 1 }}
                          type={quarter === q ? "filled" : "tonal"}
                          onPress={() => {
                            setQuarter(q);
                            applyQuarter(q, qYear);
                          }}
                        />
                      ))}
                    </View>
                    <TextInput
                      placeholder="År (ÅÅÅÅ)"
                      value={qYear}
                      onChange={(y) => {
                        setQYear(y);
                        applyQuarter(quarter, y);
                      }}
                    />
                  </View>
                )}

                <Body size="small">
                  Synlig för planering innan den är tillgänglig. Osäkert datum?
                  Välj Kvartal eller "Vet ej" — du kan uppdatera senare.
                </Body>
              </View>
            )}
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 4,
            }}
          >
            <View style={{ flex: 1 }}>
              <Title size="medium">Lägg till fler produktdetaljer</Title>
              <Body size="medium">
                Lägg till specifik info avseende mått, färg, dokument eller bra
                för köpare att veta
              </Body>
            </View>
            <Toggle
              value={showDetails}
              onPress={() => setShowDetails(!showDetails)}
            />
          </View>
          {showDetails && product.categoryIds?.[1] && (
            <>
              <View style={{ zIndex: 2 }}>
                <MeasurementsSection
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
                documents={product.documents ?? []}
                onUpdateFiles={(files) => update({ documents: files })}
              />
            </>
          )}
          <ConditionSection
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
      {showContinue && (
        <View
          style={[
            { gap: 6 },
            isDesktop && {
              position: "sticky",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              backgroundColor: "white",
              paddingBottom: 32,
            },
          ]}
        >
          <Button label="Fortsätt" onPress={onNext} style={{ marginTop: 24 }} />
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
      )}
    </View>
  );
};
