import { ComponentProps, useState } from "react";
import { LayoutChangeEvent, View, useWindowDimensions } from "react-native";
import { AdGrid } from "@components/ad/ad-grid";
import { Button } from "@components/buttons/button";
import { SectionHeader } from "@components/sections/section-header";
import { GRID_CARD, MAX_CONTENT_WIDTH } from "@constants/layout";
import { horizontalPadding } from "@constants/sizes";
import { useScreenType } from "@hooks/useScreenType";
import { getGridColumns } from "@/utils/grid";

type Props = {
  header?: string;
  onHeaderPress?: () => void;
  products: ComponentProps<typeof AdGrid>[];
  pagination?: {
    onShowMore: () => void;
    loading: boolean;
    total: number;
  };
  // Optional cap on the desktop column count. When omitted, columns are derived
  // from the grid's measured width and a target card size.
  desktopColumnNumber?: number;
};

export const AdGridSection = ({
  header,
  onHeaderPress,
  products,
  pagination,
  desktopColumnNumber,
}: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const { isDesktop } = useScreenType();
  const gapSize = isDesktop ? 24 : 16;
  const width = (screenWidth - 48) / 2;

  // Measure the grid's own width so column count works both full-width and inside a
  // narrower split (e.g. next to the search map). Seed with the capped full-width
  // estimate to keep the first paint close before onLayout fires.
  const [gridWidth, setGridWidth] = useState(
    Math.min(screenWidth, MAX_CONTENT_WIDTH) - horizontalPadding.desktop * 2,
  );
  const columns = getGridColumns(gridWidth, {
    ...GRID_CARD,
    maxColumns: desktopColumnNumber ?? GRID_CARD.maxColumns,
  });

  const onGridLayout = (event: LayoutChangeEvent) => {
    setGridWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={{ gap: 16 }}>
      {!!header && (
        <SectionHeader
          onPress={onHeaderPress ? () => onHeaderPress() : undefined}
          buttonTitle={isDesktop ? "Visa alla" : undefined}
        >
          {header}
        </SectionHeader>
      )}
      <View
        onLayout={isDesktop ? onGridLayout : undefined}
        style={[
          isDesktop
            ? {
                flexDirection: "row",
                flexWrap: "wrap",
                marginHorizontal: -12,
              }
            : {
                flexDirection: "row",
                gap: gapSize,
                flexWrap: "wrap",
              },
        ]}
      >
        {products.map((product) => (
          <View
            style={[
              { paddingBottom: 16 },
              isDesktop
                ? {
                    paddingHorizontal: 12,
                    flexBasis: `${100 / columns}%`,
                  }
                : { width },
            ]}
            key={product.id}
          >
            <AdGrid {...product} />
          </View>
        ))}
      </View>
      {!!pagination && !(products.length >= pagination.total) && (
        <Button
          label="Läs in fler"
          onPress={pagination.onShowMore}
          loading={pagination.loading}
          style={{ marginTop: 32 }}
        />
      )}
    </View>
  );
};
