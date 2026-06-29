import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from "@apollo/client";

/**
 * Minimal Apollo client for server-side static rendering (`expo export -p web`).
 *
 * The regular `initializeApollo` client (apollo/config.ts) wires up an auth link
 * that `await`s `AsyncStorage.getItem` — AsyncStorage has no Node implementation,
 * so it can't run during the static export. This client talks straight to the
 * public GraphQL endpoint with no auth, no token refresh and no error link.
 *
 * Only public data can be fetched here (the user is always logged out at build time).
 */
export const createServerApolloClient =
  (): ApolloClient<NormalizedCacheObject> => {
    return new ApolloClient({
      ssrMode: typeof window === "undefined",
      link: createHttpLink({
        uri: process.env.EXPO_PUBLIC_API_URL + "/graphql",
      }),
      cache: new InMemoryCache(),
    });
  };
