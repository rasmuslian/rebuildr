import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache,
  Observable,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import * as Sentry from "@sentry/react-native";

import { isLoggedInVar } from "@/apollo/state";
import { getStoredAccessToken, renewStoredAuthTokens } from "@/lib/auth-tokens";

export {
  internalProductFilterVar,
  isLoggedInVar,
  productFilterVar,
  showHamburgerMenuVar,
} from "@/apollo/state";

export const initializeApollo = async () => {
  const httpLink = createHttpLink({
    uri: process.env.EXPO_PUBLIC_API_URL + "/graphql",
  });

  const authLink = setContext(async (_, { headers }) => {
    const token = await getStoredAccessToken();

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

  const errorLink = onError(
    ({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        for (const err of graphQLErrors) {
          if (err.extensions?.code === "UNAUTHENTICATED") {
            return createObservable(renewStoredAuthTokens()).flatMap(
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

  const accessToken = await getStoredAccessToken();
  isLoggedInVar(!!accessToken);

  const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  });

  return client;
};
