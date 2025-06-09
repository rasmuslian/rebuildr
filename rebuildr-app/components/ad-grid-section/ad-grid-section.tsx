import { ComponentProps } from "react";
import { View } from "react-native";
import { AdGrid } from "../cards/ad-grid";
import { Headline } from "@components/typography/text";
import { Button } from "@components/buttons/button";

export const AdGridSection = ({
  header,
  products,
  pagination,
}: {
  header: string;
  products: ComponentProps<typeof AdGrid>[];
  pagination?: {
    onShowMore: () => void;
    loading: boolean;
    total: number;
  };
}) => {
  return (
    <View style={{ gap: 24 }}>
      <Headline size="small">{header}</Headline>
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          flexWrap: "wrap",
          paddingBottom: 16,
          marginTop: 16,
        }}
      >
        {products.map((product) => (
          <AdGrid key={product.id} {...product} />
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
