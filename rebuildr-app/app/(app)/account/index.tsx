import { MyAccountQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@components/buttons/button";
import { UserCard } from "@components/cards/user-card";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Body, Label } from "@components/typography/text";
import { router } from "expo-router";
import { View } from "react-native";

const MY_ACCOUNT = gql`
  query MyAccount {
    me {
      id
      username
      numberOfSoldProducts
      numberOfPublishedProducts
      rating
      likedProducts {
        id
      }
      sales {
        id
      }
      purchases {
        id
      }
      profilePicture {
        id
        url
      }
    }
  }
`;

export default function Account() {
  const { data } = useQuery<MyAccountQuery>(MY_ACCOUNT);

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenLayout
      style={{ marginTop: 24, gap: 24 }}
      headerComponent={<Header title="Konto" />}
    >
      <UserCard
        profilePictureUrl={data.me.profilePicture?.url}
        username={data.me.username}
        numberOfPublishedProducts={data.me.numberOfPublishedProducts}
        numberOfSoldProducts={data.me.numberOfSoldProducts}
        rating={data.me.rating}
      />
      <View style={{ gap: 8 }}>
        <Button
          label="Se din profil"
          onPress={() => {
            router.navigate({
              pathname: "/(app)/account/profile",
              params: {
                userId: data.me.id,
                mode: "read",
              },
            });
          }}
        />
        <Button
          label="Redigera din profil"
          type="tonal"
          onPress={() => {
            router.navigate({
              pathname: "/(app)/account/profile",
              params: {
                userId: data.me.id,
                mode: "edit",
              },
            });
          }}
        />
      </View>
      <View style={{ gap: 16 }}>
        <Divider />
        <LinkEntry
          label="Kontoinställningar"
          body="Hantera dina uppgifter och inställningar"
          onPress={() => {
            //TODO: link to account settings
          }}
        />
        <LinkEntry
          label="Dina favoriter"
          body={(data.me.likedProducts?.length ?? 0) + " annonser"}
          onPress={() => {
            //TODO: link to account settings
          }}
        />
        <LinkEntry
          label="Dina köp"
          body={data.me.purchases.length + " annonser"}
          onPress={() => {
            //TODO: link to my purchases
          }}
        />
        <LinkEntry
          label="Dina försäljningar"
          body={data.me.sales.length + " annonser"}
          onPress={() => {
            //TODO: link to account settings
          }}
        />
      </View>
    </ScreenLayout>
  );
}

type LinkEntryProps = {
  label: string;
  body: string;
  onPress: () => void;
};

const LinkEntry = ({ label, body, onPress }: LinkEntryProps) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ gap: 2 }}>
        <Label size="large">{label}</Label>
        <Body size="small">{body}</Body>
      </View>
      <Button icon="arrowRight" type="text" onPress={onPress} />
    </View>
  );
};
