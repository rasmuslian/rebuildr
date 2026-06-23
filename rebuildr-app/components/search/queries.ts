import { gql } from "@apollo/client";

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
    $searchSuggestionsInput: GetSearchSuggestionsInput!
    $productsInput: ProductsInput!
    $categoriesInput: GetCategoriesInput!
    $usersInput: UsersInput!
  ) {
    searchSuggestions(input: $searchSuggestionsInput) {
      label
      type
      categoryId
      parentId
      productCount
    }
    products(input: $productsInput, limit: 5, offset: 0) {
      total
      products {
        id
        title
        price
        primaryImage {
          id
          url
        }
      }
    }
    getCategories(input: $categoriesInput) {
      id
      name
      parentId
      image {
        id
        url
      }
    }
    users(input: $usersInput) {
      users {
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
  }
`;

export const CLEAR_SEARCH_HISTORY_MUTATION = gql`
  mutation ClearSearchHistory {
    clearSearchHistory
  }
`;
