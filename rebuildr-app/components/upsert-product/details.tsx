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
import { Title, Body } from "@components/typography/text";
import { useState } from "react";
import { Button } from "@components/buttons/button";
import { measurementKeys } from "@constants/measurements";
import { ProductFields } from "./types";
import { useScreenType } from "@hooks/useScreenType";

type Props = {
  product: ProductFields;
  update: (product: Partial<ProductFields>) => void;
  onNext: () => void;
  nextIsDisabled: boolean;
  badFields?: { [key: string]: string };
};

export const Details = ({
  product,
  update,
  onNext,
  nextIsDisabled,
  badFields,
}: Props) => {
  const { isDesktop } = useScreenType();
  const [showDetails, setShowDetails] = useState(() => {
    const measurementSet = measurementKeys.some(
      (measurementKey) => !!product[measurementKey],
    );
    //show details if any measurements are set or any documents are chosen
    return measurementSet || !!product.documents?.length;
  });

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
          onChange={() => update({ ...product, categoryIds: [rootCategoryId] })}
        />
      )}
      {categoryId && (
        <>
          <ImageSection
            images={product.images ?? []}
            imageError={badFields?.["images"]}
            onUpdateImages={(images) => {
              update({ ...product, images });
            }}
          />
          <PriceSection
            price={product.price}
            minimumPrice={product.minimumPrice ?? 0}
            priceError={badFields?.["price"]}
            isGiveaway={!!product.isGiveaway}
            onUpdate={(isGiveaway, price) => update({ isGiveaway, price })}
          />
          <DescriptionSection
            title={product.title ?? ""}
            titleError={badFields?.["title"]}
            description={product.description ?? ""}
            descriptionError={badFields?.["description"]}
            onChangeTitle={(title) => update({ title })}
            onChangeDescription={(description) => update({ description })}
          />
          <QuantitiesSection
            categoryId={categoryId}
            primaryQuantity={product.primaryQuantity}
            primaryUnit={product.primaryUnit}
            primaryError={badFields?.["primary"]}
            onBlurPrimary={({ quantity, unit }) =>
              update({
                primaryQuantity: quantity,
                primaryUnit: unit,
              })
            }
            secondaryQuantity={product.secondaryQuantity}
            secondaryUnit={product.secondaryUnit}
            onBlurSecondary={({ quantity, unit }) =>
              update({
                secondaryQuantity: quantity,
                secondaryUnit: unit,
              })
            }
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Title size="medium">Lägg till fler produktdetaljer</Title>
              <Body size="medium">
                Lägg till specifik produktinfo gällande mått, vikt eller
                dokumentation.
              </Body>
            </View>
            <Toggle
              value={showDetails}
              onPress={() => setShowDetails(!showDetails)}
            />
          </View>
          {showDetails && (
            <>
              <MeasurementsSection
                value={{
                  thickness:
                    product.thickness !== undefined
                      ? {
                          value: product.thickness,
                          unit: product.thicknessUnit,
                        }
                      : undefined,
                  height:
                    product.height !== undefined
                      ? { value: product.height, unit: product.heightUnit }
                      : undefined,
                  width:
                    product.width !== undefined
                      ? { value: product.width, unit: product.widthUnit }
                      : undefined,
                  length:
                    product.length !== undefined
                      ? { value: product.length, unit: product.lengthUnit }
                      : undefined,
                  diameter:
                    product.diameter !== undefined
                      ? { value: product.diameter, unit: product.diameterUnit }
                      : undefined,
                  weight:
                    product.weight !== undefined
                      ? { value: product.weight, unit: product.weightUnit }
                      : undefined,
                }}
                onChange={(measurementType, value, unit) => {
                  switch (measurementType) {
                    case "thickness":
                      update({ thickness: value, thicknessUnit: unit });
                      break;
                    case "height":
                      update({ height: value, heightUnit: unit });
                      break;
                    case "width":
                      update({ width: value, widthUnit: unit });
                      break;
                    case "length":
                      update({ length: value, lengthUnit: unit });
                      break;
                    case "diameter":
                      update({ diameter: value, diameterUnit: unit });
                      break;
                    case "weight":
                      update({ weight: value, weightUnit: unit });
                      break;
                  }
                }}
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
          <Button
            label="Fortsätt"
            onPress={onNext}
            style={{ marginTop: 24 }}
            disabled={nextIsDisabled}
          />
          {badFields && !!Object.keys(badFields).length && (
            <Body color="error" size="small">
              Ett fel har påträffats i ett eller flera fält
            </Body>
          )}
        </View>
      )}
    </View>
  );
};
