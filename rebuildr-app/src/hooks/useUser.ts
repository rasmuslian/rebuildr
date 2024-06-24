import { useQuery } from "@apollo/client";
import { gql } from "src/gql";

const ME_QUERY = gql(`
  query MeQuery {
    me {
      id
      email
    }
  }
`);

export const useUser = () => {
  const { data } = useQuery(ME_QUERY);

  return {
    myId: data?.me.id,
    email: data?.me.email,
  };
};
