import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Navbar } from "src/components/navbars/navbar";
import { Landing } from "src/pages/landing";
import { Login } from "src/pages/login";
import { ProductDetails } from "src/pages/productDetails";
import { Products } from "src/pages/products";
import { Register } from "src/pages/register";
import { VerifyMail } from "src/pages/verifyMail";
import { LandingStackParamList } from "./navigation.types";

export const LandingNavigation = () => {
  const Stack = createNativeStackNavigator<LandingStackParamList>();
  return (
    <Stack.Navigator screenOptions={{ header: () => <Navbar /> }}>
      <Stack.Screen name="Landing" component={Landing} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="Products" component={Products} />
      <Stack.Screen name="VerifyMail" component={VerifyMail} />
    </Stack.Navigator>
  );
};
