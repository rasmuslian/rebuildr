import { Redirect } from "expo-router";

//This is a stable redirect. When redirecting from emails or backend or any other source which does not have knowledge
//of the frontend routing structure or are immutable once sent we will use this route. This way we can change the route
//to payout freely
export default function ActivatePayoutsRedirect() {
  return <Redirect href="/account/settings/payout" />;
}
