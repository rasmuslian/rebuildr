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
};

export const AdGridSection = ({
  header,
  onHeaderPress,
  products,
  pagination,
}: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const { isDesktop } = useScreenType();
  const gapSize = isDesktop ? 24 : 16;
  const width = isDesktop
    ? (screenWidth - 75 * 2) / 4 - (gapSize * 3) / 4
    : (screenWidth - 48) / 2;

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
        style={{
          flexDirection: "row",
          gap: gapSize,
          flexWrap: "wrap",
          paddingBottom: 16,
        }}
      >
        {products.map((product) => (
          <View style={{ width }} key={product.id}>
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
