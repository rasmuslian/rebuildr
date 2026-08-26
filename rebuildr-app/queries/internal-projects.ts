import { gql } from "@apollo/client";

export const INTERNAL_PROJECT_CARD_FIELDS = gql`
  fragment InternalProjectCardFields on Project {
    id
    title
    description
    address
    location {
      lat
      lng
    }
    projectPicture {
      id
      url
    }
    user {
      id
      profilePicture {
        id
        url
      }
    }
    products {
      id
      status
      primaryImage {
        id
        url
      }
    }
  }
`;

export const INTERNAL_PROJECTS = gql`
  query InternalProjects(
    $input: InternalProjectsInput!
    $limit: Int
    $offset: Int
  ) {
    internalProjects(input: $input, limit: $limit, offset: $offset) {
      projects {
        ...InternalProjectCardFields
      }
      total
    }
  }
  ${INTERNAL_PROJECT_CARD_FIELDS}
`;

export const INTERNAL_PROJECT = gql`
  query InternalProject($projectId: ID!) {
    internalProject(projectId: $projectId) {
      ...InternalProjectCardFields
      products {
        id
        title
        status
        availability
        primaryQuantity
        primaryUnit
        condition
        price
        soldByQuantity
        primaryImage {
          id
          url
        }
      }
    }
  }
  ${INTERNAL_PROJECT_CARD_FIELDS}
`;

export const CREATE_INTERNAL_PROJECT = gql`
  mutation CreateInternalProject($input: CreateInternalProjectInput!) {
    createInternalProject(input: $input) {
      id
      title
      description
      address
      location {
        lat
        lng
      }
    }
  }
`;
export const UPDATE_INTERNAL_PROJECT = gql`
  mutation UpdateInternalProject($input: UpdateInternalProjectInput!) {
    updateInternalProject(input: $input) {
      id
      title
      description
      address
      location {
        lat
        lng
      }
    }
  }
`;
export const SET_INTERNAL_PROJECT_PICTURE = gql`
  mutation SetInternalProjectPicture(
    $projectId: ID!
    $picture: FileInputType!
  ) {
    setInternalProjectPicture(projectId: $projectId, picture: $picture)
  }
`;

export const DELETE_INTERNAL_PROJECT = gql`
  mutation DeleteInternalProject($projectId: ID!) {
    deleteInternalProject(projectId: $projectId)
  }
`;
