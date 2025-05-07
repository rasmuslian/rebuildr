import { AppQueryQuery, RegisterStatusEnum } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Body } from "@components/typography/text";
import { Redirect, Slot } from "expo-router";

const APP_QUERY = gql`
  query AppQuery {
    me {
      id
      registrationStatus
    }
  }
`;

export default function AppLayout() {
  const { data } = useQuery<AppQueryQuery>(APP_QUERY, {
    fetchPolicy: "network-only",
  });

  if (data?.me.registrationStatus === RegisterStatusEnum.Details) {
    return <Redirect href="/sign-up/details" />;
  }

  if (!data) {
    return <Body>Loading...</Body>;
  }

  return <Slot />;
}
