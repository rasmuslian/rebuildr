import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache,
  makeVar,
} from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

export const isLoggedInVar = makeVar(false);

const httpLink = createHttpLink({
  uri: "http://localhost:3000/graphql",
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

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      );

      if (extensions.code === "UNAUTHENTICATED") {
        //We need to log in again
        //TODO: refresh accessToken
        isLoggedInVar(false);
      }
    });

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

export const initializeApollo = async () => {
  //initialize reactive vars
  const accessToken = await AsyncStorage.getItem("access_token");
  isLoggedInVar(!!accessToken);

  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  });
};
