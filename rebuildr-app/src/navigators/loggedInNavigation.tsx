import { useQuery } from "@apollo/client";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { gql } from "src/apollo/__generated__/gql";
import { LoggedInNavbar } from "src/components/navbars/loggedInNavbar";
import { Landing } from "src/pages/landing";
import { Sell } from "src/pages/sell";

const LOGGED_IN_NAVIGATION = gql(`
  query LoggedInNavigation {
    me {
      email
    }
  }
`);

export const LoggedInNavigation = () => {
  const Stack = createNativeStackNavigator();

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
    </Stack.Navigator>
  );
};
