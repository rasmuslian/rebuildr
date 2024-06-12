import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache,
  makeVar,
} from "@apollo/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setContext } from "@apollo/client/link/context";

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

export const initializeApollo = async () => {
  //initialize reactive vars
  const accessToken = await AsyncStorage.getItem("access_token");
  isLoggedInVar(!!accessToken);

  return new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
  });
};
