import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { View, FlatList, Image } from "react-native";
import { Title, Headline } from "@components/typography/text";
import { Divider } from "@components/dividers/divider";
import { ROOT_CATEGORIES } from "@/queries";
import { useQuery } from "@apollo/client";
import Placeholder from "@assets/images/placeholder.png";
import {
  OrderCategoriesEnum,
  RootCategoriesQuery,
  RootCategoriesQueryVariables,
} from "@/gql/graphql";
import { Button } from "@components/buttons/button";

const Header = () => {
  return (
    <View style={{ gap: 8, paddingTop: 8 }}>
      <Title style={{ paddingVertical: 8 }} size="medium">
        Kategorier
      </Title>
      <Divider />
    </View>
  );
};

export default function Categories() {
  const { data } = useQuery<RootCategoriesQuery, RootCategoriesQueryVariables>(
    ROOT_CATEGORIES,
    {
      variables: {
        input: {
          orderBy: OrderCategoriesEnum.OrderIndexAsc,
        },
      },
    },
  );

  return (
    <ScreenLayout headerComponent={<Header />}>
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={data?.rootCategories}
        contentContainerStyle={{ gap: 16 }}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                flex: 1,
              }}
            >
              <Image
                source={item.image ? item.image.url : Placeholder.uri}
                style={{
                  height: 60,
                  width: 60,
                  borderRadius: 100,
                }}
              />

              <Headline size="small" ellipsizeMode="tail" numberOfLines={1}>
                {item.name}
              </Headline>
            </View>

            <Button
              icon={"chevronRight"}
              type="text"
              onPress={() => {
                console.log("item.name :>> ", item.name);
              }}
            />
          </View>
        )}
      />
    </ScreenLayout>
  );
}
