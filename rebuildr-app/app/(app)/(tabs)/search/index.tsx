import { isLoggedInVar } from "@/apollo/config";
import {
  ClearSearchHistoryMutation,
  CreateSearchResultMutation,
  CreateSearchResultMutationVariables,
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
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { router } from "expo-router";
import { Badge } from "@components/badges/badge";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { textStyles } from "@components/typography/typeface";
import { Header } from "@components/navigation/headers/header";
import { Avatar } from "@components/avatar/avatar";

const SEARCH = gql`
  query Search($isLoggedIn: Boolean!, $searchResult: GetSearchResultsInput!) {
    popularCategories {
      id
      name
      parentId
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

const CREATE_SEARCH_RESULT = gql`
  mutation CreateSearchResult($input: CreateSearchResultInput!) {
    createSearchResult(input: $input) {
      id
      searchString
      count
    }
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
  const [createSearchResult] = useMutation<
    CreateSearchResultMutation,
    CreateSearchResultMutationVariables
  >(CREATE_SEARCH_RESULT);

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
    if (searchString) {
      createSearchResult({ variables: { input: { searchString } } });
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
                  setCategories({
                    categories: [category],
                    selectedCategoryId: category.id,
                  });
                  router.navigate("/(app)/(tabs)/search/products");
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
        )}
      </>
    );
  };

  const renderSearchResult = () => {
    return (
      <>
        {!!searchData?.getSimilarSearchResults.length && (
          <View
            style={[
              { gap: 12, paddingBottom: 16 },
              !!searchData?.getUsers.length &&
                dividerStyles(colors).bottomDivider,
            ]}
          >
            <Headline size="small">Sökförslag</Headline>
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
        )}
        {!!searchData?.getUsers.length && (
          <View>
            <Headline size="small">Säljare</Headline>
            <View style={{ marginTop: 12, gap: 16 }}>
              {searchData.getUsers.map((user, i) => (
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
        )}
      </>
    );
  };

  return (
    <ScreenLayout
      headerComponent={
        <Header
          ctas={[{ icon: "X", onPress: () => setSearchString("") }]}
          middle={
            <TextInput
              style={{
                outline: "none",
                flex: 1,
                color: colors.text.primaryDark,
                ...textStyles.title["medium"],
              }}
              placeholder="Vad letar du efter?"
              placeholderTextColor={colors.text.secondary}
              value={searchString}
              onChangeText={(s) => onChangeSearch(s)}
              onSubmitEditing={onSearch}
              autoFocus
            />
          }
        />
      }
      style={{ gap: 24 }}
    >
      {searchString ? renderSearchResult() : renderNoSearch()}
    </ScreenLayout>
  );
}
