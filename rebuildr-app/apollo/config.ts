import {
  ApolloClient,
  createHttpLink,
  from,
  fromPromise,
  gql,
  InMemoryCache,
  makeVar,
} from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const GET_NEW_TOKENS = gql(`
mutation GetNewTokens($input: GetNewTokensInput!) {
  getNewTokens(input: $input) {
    accessToken
    refreshToken
  }
}
`);
export const isLoggedInVar = makeVar(false);
export const initializeApollo = async () => {
  const httpLink = createHttpLink({
    uri:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/graphql"
        : "https://rebuildr-backend-6a7ah.ondigitalocean.app/graphql",
  });

  const authLink = setContext(async (_, { headers }) => {
    const token = await AsyncStorage.getItem("access_token");

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  const renewTokens = async () => {
    console.log("Refreshing tokens");
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    const accessToken = await AsyncStorage.getItem("access_token");

    if (!refreshToken || !accessToken) {
      throw new Error("Missing tokens");
    }

    const data = await client.mutate({
      mutation: GET_NEW_TOKENS,
      variables: { input: { refreshToken, accessToken } },
    });
    const newTokens = data.data.getNewTokens;
    if (!newTokens.accessToken || !newTokens.refreshToken) {
      await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
      throw new Error("Refresh tokens unsuccessful");
    }

    await AsyncStorage.multiSet([
      ["access_token", newTokens.accessToken],
      ["refresh_token", newTokens.refreshToken],
    ]);

    return newTokens.accessToken;
  };

  const errorLink = onError(
    ({ graphQLErrors, operation, forward, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          );
        });
      }

      if (networkError) console.log(`[Network error]: ${networkError}`);

      for (const err of graphQLErrors) {
        if (err.extensions.code === "UNAUTHENTICATED") {
          return fromPromise(
            renewTokens().catch((error) => {
              console.error("Failed update refresh token");
              console.error(error);
              Promise.all([
                AsyncStorage.removeItem("access_token"),
                AsyncStorage.removeItem("refresh_token"),
              ]).then(() => {
                isLoggedInVar(false);
              });
            }),
          )
            .filter((value) => Boolean(value))
            .flatMap((accessToken) => {
              const oldHeaders = operation.getContext().headers;
              operation.setContext({
                Headers: {
                  ...oldHeaders,
                  authorization: `Bearer ${accessToken}`,
                },
              });
              return forward(operation);
            });
        }
      }
    },
  );

  //initialize reactive vars
  const accessToken = await AsyncStorage.getItem("access_token");
  isLoggedInVar(!!accessToken);

  const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  });

  return client;
};
