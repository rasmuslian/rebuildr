import { useQuery } from "@apollo/client";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { gql } from "src/gql";
import { LoggedInNavbar } from "src/components/navbars/loggedInNavbar";
import { Landing } from "src/pages/landing";
import { Sell } from "src/pages/sell";
import { ProductDetails } from "src/pages/productDetails";
import { Conversation } from "src/pages/conversation";
import { LoggedInStackParamList } from "./navigation.types";
import { Conversations } from "src/pages/conversations";
import { Account } from "src/pages/account";
import { Products } from "src/pages/products";
import { UserRoleEnum } from "src/gql/graphql";
import { EditCategories } from "src/pages/editCategories";

const LOGGED_IN_NAVIGATION = gql(`
  query LoggedInNavigation {
    me {
      id
      email
      role
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
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="Conversation" component={Conversation} />
      <Stack.Screen name="Conversations" component={Conversations} />
      <Stack.Screen name="Account" component={Account} />
      <Stack.Screen name="Products" component={Products} />
      {data.me.role === UserRoleEnum.Admin && (
        <Stack.Screen name="EditCategories" component={EditCategories} />
      )}
    </Stack.Navigator>
  );
};
