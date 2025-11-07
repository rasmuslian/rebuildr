import { useReactiveVar, gql, useQuery } from "@apollo/client";
import { isLoggedInVar } from "@/apollo/config";
import { GetMeQuery, GetMeQueryVariables } from "@/gql/graphql";

const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      profilePicture {
        id
        url
      }
    }
  }
`;

export const useUser = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const { data } = useQuery<GetMeQuery, GetMeQueryVariables>(GET_ME, {
    variables: {},
    skip: !isLoggedIn,
  });

  return {
    isLoggedIn,
    me: data?.me,
  };
};
