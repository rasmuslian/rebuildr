import { gql } from "@apollo/client";

export const TAB_LAYOUT = gql`
  query TabLayout {
    getUnreadConversationsCount
  }
`;
