import { FlatList, View, useWindowDimensions } from "react-native";
import { SectionHeader } from "./section-header";

type Props<T> = {
  title: string;
  onPress?: () => void;
  data: T[];
  renderItem: ({ item }: { item: T }) => React.ReactNode;
  visibleItems: 2 | 3;
  keyExtractor?: (item: T) => string;
};

export const HoriztalListSection = <T,>({
  title,
  onPress,
  data,
  renderItem,
  visibleItems = 2,
  keyExtractor,
}: Props<T>) => {
  const { width: screenWidth } = useWindowDimensions();

  const singleItem = data.length === 1;
  let widthMultiplier = 0.4;
  if (visibleItems === 2) {
    widthMultiplier = 0.75;
  }
  if (singleItem) {
    widthMultiplier = 1;
  }
  return (
    <View style={{ gap: 16 }}>
      <SectionHeader onPress={onPress}>{title}</SectionHeader>
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ gap: 16, marginHorizontal: 16 }}
        horizontal
        style={{ marginHorizontal: -16 }}
        renderItem={({ item }) => (
          <View
            style={{
              width: (screenWidth - 32) * widthMultiplier,
            }}
          >
            {renderItem({ item })}
          </View>
        )}
      />
    </View>
  );
};
