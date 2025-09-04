import { ComponentProps } from "react";
import { View, useWindowDimensions } from "react-native";
import { AdGrid } from "@components/ad/ad-grid";
import { Button } from "@components/buttons/button";
import { SectionHeader } from "@components/sections/section-header";

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
  const width = (screenWidth - 48) / 2;
  return (
    <View style={{ gap: 24 }}>
      {!!header && (
        <SectionHeader
          onPress={onHeaderPress ? () => onHeaderPress() : undefined}
        >
          {header}
        </SectionHeader>
      )}
      <View
        style={{
          flexDirection: "row",
          gap: 16,
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
      {!!pagination && (
        <Button
          label="Läs in fler"
          onPress={pagination.onShowMore}
          loading={pagination.loading}
          disabled={products.length >= pagination.total}
          style={{ marginTop: 24 }}
        />
      )}
    </View>
  );
};
