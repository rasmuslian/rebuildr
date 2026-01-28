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
    $searchResultsInput: GetSimilarSearchResultsInput!
    $usersInput: UsersInput!
  ) {
    getSimilarSearchResults(input: $searchResultsInput) {
      id
      searchString
      count
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

export const CREATE_SEARCH_RESULT = gql`
  mutation CreateSearchResult($input: CreateSearchResultInput!) {
    createSearchResult(input: $input) {
      id
      searchString
      count
    }
  }
`;
