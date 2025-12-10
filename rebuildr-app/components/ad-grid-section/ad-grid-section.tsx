import { ComponentProps } from "react";
import { View, useWindowDimensions } from "react-native";
import { AdGrid } from "@components/ad/ad-grid";
import { Button } from "@components/buttons/button";
import { SectionHeader } from "@components/sections/section-header";
import { useScreenType } from "@hooks/useScreenType";

type Props = {
  header?: string;
  onHeaderPress?: () => void;
  products: ComponentProps<typeof AdGrid>[];
  pagination?: {
    onShowMore: () => void;
    loading: boolean;
    total: number;
  };
  desktopColumnNumber?: number;
};

export const AdGridSection = ({
  header,
  onHeaderPress,
  products,
  pagination,
  desktopColumnNumber = 4,
}: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const { isDesktop } = useScreenType();
  const gapSize = isDesktop ? 24 : 16;
  const width = (screenWidth - 48) / 2;

  return (
    <View style={{ gap: 24 }}>
      {!!header && (
        <SectionHeader
          onPress={onHeaderPress ? () => onHeaderPress() : undefined}
          buttonTitle={isDesktop ? "Visa alla" : undefined}
        >
          {header}
        </SectionHeader>
      )}
      <View
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
                    flexBasis: `${100 / desktopColumnNumber}%`,
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
          style={{ marginTop: 24 }}
        />
      )}
    </View>
  );
};
