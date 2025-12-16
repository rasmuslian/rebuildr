import { DoSearchQuery, UserType } from "@/gql/graphql";
import { Avatar } from "@components/avatar/avatar";
import { Badge } from "@components/badges/badge";
import { Button } from "@components/buttons/button";
import { dividerStyles } from "@components/dividers/divider";
import { Body, Headline, Label, Title } from "@components/typography/text";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { useSearchContext } from "@context/search-context";

type Props = {
  data: DoSearchQuery | undefined;
  searchString?: string;
  size?: "small" | "large";
};

export const SearchWithResults = ({
  data,
  searchString,
  size = "large",
}: Props) => {
  const { filterBuilder } = useFilterProduct();
  const searchContext = useSearchContext();

  const colors = useThemeColor();
  const Header = ({ children }: { children: React.ReactNode }) => {
    if (size === "large") {
      return <Headline size="small">{children}</Headline>;
    } else {
      return <Title size="medium">{children}</Title>;
    }
  };
  return (
    <>
      <View
        style={[
          {
            gap: 12,
            paddingBottom: data?.getSimilarSearchResults?.length ? 16 : 12,
          },
          dividerStyles(colors).bottomDivider,
        ]}
      >
        <View>
          <Header>Andra söker efter</Header>
          {!data?.getSimilarSearchResults?.length && (
            <View>
              <Body size="medium">
                Ojdå, vi kunde inte hitta några annonser som matchar '
                {searchString}'.
              </Body>
              <View
                style={{ flexShrink: 1, marginTop: 12, flexDirection: "row" }}
              >
                <Button
                  onPress={() => {
                    router.navigate("/search");
                  }}
                  label="Sök igen"
                />
              </View>
            </View>
          )}
        </View>
        <View style={{ gap: 16 }}>
          {data?.getSimilarSearchResults?.map((searchResult, i) => (
            <Pressable
              key={i}
              onPress={() => {
                filterBuilder
                  .reset()
                  .setSearchString(searchResult.searchString)
                  .apply();
                searchContext.setSearchState({
                  dropdownVisible: false,
                  searchString: searchResult.searchString,
                });
                searchContext.search(searchResult.searchString);
                router.navigate("/search/products");
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Label size="large">{searchResult.searchString}</Label>
                  <Body size="small">
                    {searchResult.count}{" "}
                    {searchResult.count === 1 ? "träff" : "träffar"}
                  </Body>
                </View>
                <Icon icon="search" size={18} />
              </View>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={{ paddingVertical: 0 }}>
        <Header>Säljare</Header>
        {!data?.getUsers?.length && (
          <View>
            <Body size="medium">
              Hoppsan! Det verkar inte finnas någon säljare som heter '
              {searchString}'.
            </Body>
          </View>
        )}
        <View style={{ marginTop: 12, gap: 16 }}>
          {data?.getUsers.map((user, i) => (
            <Pressable
              key={i}
              onPress={() => {
                router.navigate({
                  pathname: "/account/profile",
                  params: { userId: user.id },
                });
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <Avatar
                  placeholder={user.type}
                  imageUrl={user.profilePicture?.url}
                />
                <View style={{ gap: 2, flex: 1 }}>
                  <Label size="large">{user.username}</Label>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    {user.type === UserType.Business && (
                      <View>
                        <Badge size="medium" text="Företag" />
                      </View>
                    )}

                    <Body size="small">
                      {user.numberOfPublishedProducts} annonser •{" "}
                      {user.numberOfSoldProducts} sålda
                    </Body>
                  </View>
                </View>
                <Icon icon="search" size={18} />
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </>
  );
};
