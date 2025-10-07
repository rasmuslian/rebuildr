import { View } from "react-native";
import { ProductFields } from "./sell-product-bottom-sheet";
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
    <View style={{ gap: 24, marginTop: 24 }}>
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
            price={product.price ?? 0}
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
                  thickness: product.thickness,
                  height: product.height,
                  width: product.width,
                  length: product.length,
                  diameter: product.diameter,
                  weight: product.weight,
                }}
                onChange={(measurementType, value) =>
                  update({ [measurementType]: value })
                }
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
        <View style={{ gap: 6 }}>
          <Button
            label="Fortsätt"
            onPress={onNext}
            style={{ marginTop: 24 }}
            disabled={nextIsDisabled}
          />
          {badFields && (
            <Body color="error" size="small">
              Ett fel har påträffats i ett eller flera fält
            </Body>
          )}
        </View>
      )}
    </View>
  );
};
