import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Navbar } from "src/components/navbars/navbar";
import { Buy } from "src/pages/buy";
import { Landing } from "src/pages/landing";
import { Login } from "src/pages/login";
import { ProductDetails } from "src/pages/productDetails";
import { Register } from "src/pages/register";
import { LandingStackParamList } from "./navigation.types";

export const LandingNavigation = () => {
  const Stack = createNativeStackNavigator<LandingStackParamList>();
  return (
    <Stack.Navigator screenOptions={{ header: () => <Navbar /> }}>
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Buy" component={Buy} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
    </Stack.Navigator>
  );
};
