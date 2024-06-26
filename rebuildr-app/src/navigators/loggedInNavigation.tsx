import { useQuery } from "@apollo/client";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { gql } from "src/gql";
import { LoggedInNavbar } from "src/components/navbars/loggedInNavbar";
import { Landing } from "src/pages/landing";
import { Sell } from "src/pages/sell";
import { Buy } from "src/pages/buy";
import { ProductDetails } from "src/pages/productDetails";
import { Conversation } from "src/pages/conversation";
import { LoggedInStackParamList } from "./navigation.types";
import { Conversations } from "src/pages/conversations";
import { Account } from "src/pages/account";

const LOGGED_IN_NAVIGATION = gql(`
  query LoggedInNavigation {
    me {
      email
    }
  }
`);

export const LoggedInNavigation = () => {
  const Stack = createNativeStackNavigator<LoggedInStackParamList>();

  const { data } = useQuery(LOGGED_IN_NAVIGATION);

  if (!data) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{ header: () => <LoggedInNavbar me={data.me} /> }}
    >
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen name="Sell" component={Sell} />
      <Stack.Screen name="Buy" component={Buy} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="Conversation" component={Conversation} />
      <Stack.Screen name="Conversations" component={Conversations} />
      <Stack.Screen name="Account" component={Account} />
    </Stack.Navigator>
  );
};
