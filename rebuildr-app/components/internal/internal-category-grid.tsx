import { internalProductFilterVar } from "@/apollo/config";
import { initialFilterProduct } from "@context/filter-product-context";
import { Avatar } from "@components/avatar/avatar";
import { SectionHeader } from "@components/sections/section-header";
import { Label } from "@components/typography/text";
import { useScreenType } from "@hooks/useScreenType";
import { router } from "expo-router";
import { ScrollView, TouchableOpacity, View } from "react-native";

type Props = {
  categories: Array<{
    category: {
      id: string;
      name: string;
      image?: { url: string } | null;
    };
  }>;
};

export function InternalCategoryGrid({ categories }: Props) {
  const { isDesktop } = useScreenType();

  if (!categories.length) return null;

  return (
    <View style={{ marginHorizontal: -16 }}>
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <SectionHeader>Kategorier</SectionHeader>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: isDesktop ? 16 : 8,
        }}
      >
        {categories.map(({ category }) => (
          <TouchableOpacity
            key={category.id}
            style={{
              width: isDesktop ? 100 : 80,
              alignItems: "center",
              gap: isDesktop ? 14 : 12,
            }}
            onPress={() => {
              internalProductFilterVar({
                ...initialFilterProduct,
                rootCategoryIds: [category.id],
              });
              router.navigate("/internal/search");
            }}
          >
            <Avatar
              imageUrl={category.image?.url}
              size={isDesktop ? 88 : 60}
              placeholder="CATEGORY"
            />
            <Label
              size="medium"
              style={{ paddingHorizontal: 2, textAlign: "center" }}
            >
              {category.name}
            </Label>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
