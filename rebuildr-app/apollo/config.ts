import {
  ApolloClient,
  createHttpLink,
  from,
  gql,
  InMemoryCache,
  makeVar,
  Observable,
} from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { initialFilterProduct } from "@context/filter-product-context";
import * as Sentry from "@sentry/react-native";

const GET_NEW_TOKENS = gql`
  mutation GetNewTokens($input: GetNewTokensInput!) {
    getNewTokens(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

export const isLoggedInVar = makeVar(false);
export const showHamburgerMenuVar = makeVar(false);
export const productFilterVar = makeVar(initialFilterProduct);
export const internalProductFilterVar = makeVar(initialFilterProduct);

export const initializeApollo = async () => {
  let refreshPromise: Promise<string> | null = null;
  let client: ApolloClient<any>;

  const httpLink = createHttpLink({
    uri: process.env.EXPO_PUBLIC_API_URL + "/graphql",
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

  const createObservable = (promise: Promise<any>) => {
    return new Observable((observer) => {
      promise
        .then((value) => {
          observer.next(value);
          observer.complete();
        })
        .catch((err) => observer.error(err));
    });
  };

  const renewTokens = async (client: ApolloClient<any>) => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = new Promise(async (resolve, reject) => {
      try {
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        const accessToken = await AsyncStorage.getItem("access_token");

        if (!refreshToken || !accessToken) {
          throw new Error("Missing tokens");
        }

        const { data } = await client.mutate({
          mutation: GET_NEW_TOKENS,
          variables: { input: { refreshToken, accessToken } },
        });

        const newTokens = data?.getNewTokens;

        if (!newTokens?.accessToken || !newTokens?.refreshToken) {
          throw new Error("Invalid token response");
        }

        await AsyncStorage.multiSet([
          ["access_token", newTokens.accessToken],
          ["refresh_token", newTokens.refreshToken],
        ]);

        resolve(newTokens.accessToken);
      } catch (err) {
        Sentry.captureException(err);
        await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
        isLoggedInVar(false);

        reject(err);
      } finally {
        refreshPromise = null;
      }
    });

    return refreshPromise;
  };

  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        for (const err of graphQLErrors) {
          if (err.extensions?.code === "UNAUTHENTICATED") {
            return createObservable(renewTokens(client)).flatMap(
              (newAccessToken) => {
                if (!newAccessToken) return forward(operation);
                const oldHeaders = operation.getContext().headers;
                operation.setContext({
                  headers: {
                    ...oldHeaders,
                    authorization: `Bearer ${newAccessToken}`,
                  },
                });

                return forward(operation);
              },
            );
          } else {
            Sentry.captureMessage(
              `GraphQL Error: ${err.message}, Location: ${err.locations}, Path: ${err.path}`,
            );
          }
        }
      }
      if (networkError) {
        if (__DEV__) {
          console.error("Network Error:", networkError);
        }
      }
    },
  );

  const accessToken = await AsyncStorage.getItem("access_token");
  isLoggedInVar(!!accessToken);

  client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  });

  return client;
};
