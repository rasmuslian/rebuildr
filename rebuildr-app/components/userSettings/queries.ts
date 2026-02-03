import { gql } from "@apollo/client";

const ACCOUNT_SETTINGS_USER_FRAGMENT = gql`
  fragment AccountSettingsUserFragment on User {
    id
    type
    email
    username
    phoneNumber
    name
    address
    postCode
    city
    organizationNumber
    websiteUrl
  }
`;

export const ACCOUNT_SETTINGS_USER = gql`
  query AccountSettingsUser {
    me {
      ...AccountSettingsUserFragment
    }
  }
  ${ACCOUNT_SETTINGS_USER_FRAGMENT}
`;

export const ACCOUNT_SETTINGS_UPDATE_USER = gql`
  mutation AccountSettingsUpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        ...AccountSettingsUserFragment
      }
    }
  }
  ${ACCOUNT_SETTINGS_USER_FRAGMENT}
`;
