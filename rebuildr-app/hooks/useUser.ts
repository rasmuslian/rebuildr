import { useReactiveVar, gql, useQuery } from "@apollo/client";
import { isLoggedInVar } from "@/apollo/config";
import { GetMeQuery, GetMeQueryVariables } from "@/gql/graphql";

const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      type
      description
      numberOfSoldProducts
      numberOfPublishedProducts
      rating
      isVerified
      sellerAccount {
        canReceivePayment
      }
      profilePicture {
        id
        url
      }
    }
  }
`;

export const useUser = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const { data, loading, refetch } = useQuery<GetMeQuery, GetMeQueryVariables>(
    GET_ME,
    {
      variables: {},
      skip: !isLoggedIn,
    },
  );

  return {
    isLoggedIn,
    me: data?.me,
    loading,
    refetch,
  };
};
