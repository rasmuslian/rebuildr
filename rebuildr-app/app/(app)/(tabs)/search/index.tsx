import { isLoggedInVar } from "@/apollo/config";
import {
  CreateSearchResultMutation,
  CreateSearchResultMutationVariables,
  SearchQuery,
  SearchQueryVariables,
} from "@/gql/graphql";
import { useMutation, useQuery } from "@apollo/client";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Icon } from "@icons/icon";
import { TextInput, TextInputSubmitEditingEvent } from "react-native";
import { useThemeColor } from "@hooks/useThemeColor";
import { router } from "expo-router";
import { textStyles } from "@components/typography/typeface";
import { Header } from "@components/navigation/headers/header";
import { SearchEmptyState } from "@components/search/search-empty-state";
import { SearchWithResults } from "@components/search/search-with-results";
import { useFilterProduct } from "@hooks/useFilterProduct";
import { CREATE_SEARCH_RESULT, SEARCH } from "@components/search/queries";
import { useSearchContext } from "@context/search-context";

export default function Search() {
  const { searchState, setSearchState, search } = useSearchContext();
  const filterContext = useFilterProduct();
  const colors = useThemeColor();

  const { data } = useQuery<SearchQuery, SearchQueryVariables>(SEARCH, {
    variables: {
      isLoggedIn: isLoggedInVar(),
      searchResult: { page: 0, pageSize: 10 },
    },
  });

  const [createSearchResult] = useMutation<
    CreateSearchResultMutation,
    CreateSearchResultMutationVariables
  >(CREATE_SEARCH_RESULT);

  const handleChange = (text: string) => {
    setSearchState({ searchString: text });
    search(text);
  };

  const onSubmit = (event: TextInputSubmitEditingEvent) => {
    const { text } = event.nativeEvent;

    if (text) {
      createSearchResult({ variables: { input: { searchString: text } } });
    }

    filterContext.resetAndSetSearchString(text);
    router.navigate("/search/products");
  };

  return (
    <ScreenLayout
      headerComponent={
        <Header
          ctas={
            searchState.searchString
              ? [
                  {
                    icon: "X",
                    onPress: () => setSearchState({ searchString: undefined }),
                  },
                ]
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
                value={searchState.searchString ?? ""}
                onChangeText={handleChange}
                onSubmitEditing={onSubmit}
                autoFocus
              />
            </>
          }
        />
      }
      style={{ gap: 16 }}
    >
      {searchState.searchString ? (
        <SearchWithResults
          data={searchState.searchData}
          searchString={searchState.searchString}
        />
      ) : (
        <SearchEmptyState data={data} />
      )}
    </ScreenLayout>
  );
}
