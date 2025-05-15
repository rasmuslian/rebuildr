import { isLoggedInVar } from "@/apollo/config";
import {
  ClearSearchHistoryMutation,
  DoSearchQuery,
  DoSearchQueryVariables,
  SearchQuery,
  SearchQueryVariables,
  UserType,
} from "@/gql/graphql";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { ImageQuickLink } from "@components/buttons/imageQuickLink";
import { dividerStyles } from "@components/dividers/divider";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Headline, Label } from "@components/typography/text";
import { Icon } from "@icons/icon";
import { TextInput, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import Placeholder from "@assets/images/placeholder.png";
import PlaceholderProfile from "@assets/images/placeholder-profile.png";
import PlaceholderProfileBusiness from "@assets/images/placeholder-profile-business.png";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Badge } from "@components/badges/badge";
import { useFilterProduct } from "@hooks/useFilterProduct";

const SEARCH = gql`
  query Search($isLoggedIn: Boolean!, $searchResult: GetSearchResultsInput!) {
    popularCategories {
      id
      name
      image {
        id
        url
      }
    }
    getSearchResults(input: $searchResult) @include(if: $isLoggedIn) {
      id
      searchString
      count
    }
    me @include(if: $isLoggedIn) {
      id
    }
  }
`;

const DO_SEARCH = gql`
  query DoSearch(
    $searchResultsInput: GetSimilarSearchResultsInput!
    $usersInput: GetUsersInput!
  ) {
    getSimilarSearchResults(input: $searchResultsInput) {
      id
      searchString
      count
    }
    getUsers(input: $usersInput) {
      id
      username
      type
      numberOfPublishedProducts
      numberOfSoldProducts
      profilePicture {
        id
        url
      }
    }
  }
`;

const CLEAR_SEARCH_HISTORY_MUTATION = gql`
  mutation ClearSearchHistory {
    clearSearchHistory
  }
`;

export default function Search() {
  const [searchString, setSearchString] = useState("");
  const colors = useThemeColor();
  const { setCategories } = useFilterProduct();
  const { data } = useQuery<SearchQuery, SearchQueryVariables>(SEARCH, {
    variables: {
      isLoggedIn: isLoggedInVar(),
      searchResult: { page: 0, pageSize: 10 },
    },
  });
  const [search, { data: searchData }] = useLazyQuery<
    DoSearchQuery,
    DoSearchQueryVariables
  >(DO_SEARCH);
  const [clearSearchHistory, { client }] =
    useMutation<ClearSearchHistoryMutation>(CLEAR_SEARCH_HISTORY_MUTATION, {
      onCompleted: (data) => {
        if (data.clearSearchHistory) {
          client.refetchQueries({ include: ["Search"] });
        }
      },
    });

  const onChangeSearch = (s: string) => {
    if (s) {
      search({
        variables: {
          searchResultsInput: { searchString: s },
          usersInput: { name: s },
        },
      });
    }

    setSearchString(s);
  };
  const onSearch = () => {
    if (!searchString) {
      return;
    }

    router.navigate({
      pathname: "/search/products",
      params: { searchString },
    });
  };

  const renderNoSearch = () => {
    return (
      <>
        <View
          style={[
            { gap: 12, paddingBottom: 16 },
            dividerStyles(colors).bottomDivider,
          ]}
        >
          <Headline size="small">Populära kategorier</Headline>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {data?.popularCategories.map((category, i) => (
              <ImageQuickLink
                key={i}
                onPress={() => {
                  setCategories([category.id]);
                  router.navigate("/(app)/search/products");
                }}
                source={category.image ? category.image.url : Placeholder.uri}
                label={category.name}
              />
            ))}
          </View>
        </View>
        {!!data?.getSearchResults?.length && (
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Headline size="small">Tidigare sökningar</Headline>
              <Button
                label="Rensa"
                type="tonal"
                onPress={() => clearSearchHistory()}
              />
            </View>
            <View style={{ gap: 16 }}>
              {data.getSearchResults.map((searchResult, i) => (
                <Pressable
                  key={i}
                  onPress={() =>
                    router.navigate({
                      pathname: "/search/products",
                      params: { searchString: searchResult.searchString },
                    })
                  }
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View>
                      <Label size="large">"{searchResult.searchString}"</Label>
                      <Body size="small">{searchResult.count} träffar</Body>
                    </View>
                    <Icon icon="search" size={18} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </>
    );
  };

  const renderSearchResult = () => {
    return (
      <>
        <View
          style={[
            { gap: 12, paddingBottom: 16 },
            dividerStyles(colors).bottomDivider,
          ]}
        >
          <View>
            <Headline size="small">Andra söker efter</Headline>
          </View>
          {searchData?.getSimilarSearchResults.length ? (
            <View style={{ gap: 16, marginBottom: 12 }}>
              {searchData.getSimilarSearchResults.map((searchResult, i) => (
                <Pressable
                  key={i}
                  onPress={() =>
                    router.navigate({
                      pathname: "/search/products",
                      params: { searchString: searchResult.searchString },
                    })
                  }
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
                      <Body size="small">{searchResult.count} träffar</Body>
                    </View>
                    <Icon icon="search" size={18} />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={{ gap: 24, marginBottom: 2 }}>
              <Body size="medium" color="secondary">
                Ojdå, vi kunde inte hitta några annonser som matchar '
                {searchString}'
              </Body>
              <View style={{ flexDirection: "row" }}>
                <Button
                  label="Sök igen"
                  onPress={() => {
                    setSearchString("");
                  }}
                />
              </View>
            </View>
          )}
        </View>
        <View>
          <Headline size="small">Säljare</Headline>
          {searchData?.getUsers.length ? (
            <View style={{ marginTop: 12, gap: 16 }}>
              {searchData.getUsers.map((user, i) => (
                <Pressable
                  key={i}
                  onPress={() => {
                    //TODO: Navigate to profile screen
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    {user.type === UserType.Personal ? (
                      <Image
                        source={
                          user.profilePicture?.url ?? PlaceholderProfile.uri
                        }
                        style={{ height: 40, width: 40, borderRadius: 38 }}
                      />
                    ) : (
                      <Image
                        source={
                          user.profilePicture?.url ??
                          PlaceholderProfileBusiness.uri
                        }
                        style={{ height: 40, width: 40, borderRadius: 38 }}
                      />
                    )}
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
          ) : (
            <Body size="medium" color="secondary" style={{ marginTop: 2 }}>
              Hoppsan! Det verkar inte finnas någon säljare som heter '
              {searchString}'.{" "}
            </Body>
          )}
        </View>
      </>
    );
  };

  return (
    <ScreenLayout
      headerComponent={
        <View
          style={[
            { marginBottom: 24, paddingVertical: 16, gap: 16 },
            dividerStyles(colors).bottomDivider,
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 18,
            }}
          >
            <Pressable onPress={onSearch}>
              <Icon icon="arrowLeft" size={18} />
            </Pressable>
            <TextInput
              style={{ outline: "none", flex: 1 }}
              placeholder="Vad letar du efter?"
              value={searchString}
              onChangeText={(s) => onChangeSearch(s)}
              onSubmitEditing={onSearch}
              autoFocus
            />
            <Pressable
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace("/")
              }
            >
              <Icon icon="X" size={18} />
            </Pressable>
          </View>
        </View>
      }
      style={{ gap: 24 }}
    >
      {searchString ? renderSearchResult() : renderNoSearch()}
    </ScreenLayout>
  );
}
