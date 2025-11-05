import { isLoggedInVar } from "@/apollo/config";
import {
  CreateSearchResultMutation,
  CreateSearchResultMutationVariables,
  DoSearchQuery,
  DoSearchQueryVariables,
  SearchQuery,
  SearchQueryVariables,
} from "@/gql/graphql";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Icon } from "@icons/icon";
import { TextInput } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { useState } from "react";
import { router } from "expo-router";
import { textStyles } from "@components/typography/typeface";
import { Header } from "@components/navigation/headers/header";
import { SearchEmptyState } from "@components/search/search-empty-state";
import { SearchWithResults } from "@components/search/search-with-results";

export const SEARCH = gql`
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

export const DO_SEARCH = gql`
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

export const CLEAR_SEARCH_HISTORY_MUTATION = gql`
  mutation ClearSearchHistory {
    clearSearchHistory
  }
`;

export const CREATE_SEARCH_RESULT = gql`
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

  return (
    <ScreenLayout
      headerComponent={
        <Header
          ctas={
            searchString
              ? [{ icon: "X", onPress: () => setSearchString("") }]
              : undefined
          }
          showBackButton={false}
          middle={
            <>
              <Icon
                icon="search"
                size={18}
                style={{ marginRight: 10, height: 40 }}
              />
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
            </>
          }
        />
      }
      style={{ gap: 16 }}
    >
      {searchString ? (
        <SearchWithResults data={searchData} searchString={searchString} />
      ) : (
        <SearchEmptyState data={data} />
      )}
    </ScreenLayout>
  );
}
