import { MyAccountQuery } from "@/gql/graphql";
import { gql, useQuery } from "@apollo/client";
import { LinkEntry } from "@components/account/link-entry";
import { Button } from "@components/buttons/button";
import { UserCard } from "@components/cards/user-card";
import { Divider } from "@components/dividers/divider";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { Header } from "@components/navigation/headers/header";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { router, useFocusEffect } from "expo-router";
import { View } from "react-native";
import { useCallback } from "react";

export const MY_ACCOUNT = gql`
  query MyAccount {
    me {
      id
      username
      type
      numberOfSoldProducts
      numberOfPublishedProducts
      rating
      likedProducts {
        total
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
  const { data, refetch } = useQuery<MyAccountQuery>(MY_ACCOUNT);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  if (!data) {
    return <LoadingSpinner />;
  }

  return (
    <ScreenLayout
      style={{ marginTop: 24, gap: 24 }}
      headerComponent={<Header title="Konto" />}
    >
      <UserCard
        userType={data.me.type}
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
              pathname: "/account/profile",
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
              pathname: "/account/profile",
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
            router.navigate("/account/settings");
          }}
        />
        <LinkEntry
          label="Dina favoriter"
          body={(data.me.likedProducts?.total ?? 0) + " annonser"}
          onPress={() => {
            router.navigate("/account/favorites");
          }}
        />
        <LinkEntry
          label="Dina köp"
          body={data.me.purchases.length + " annonser"}
          onPress={() => {
            router.navigate("/account/purchases");
          }}
        />
        <LinkEntry
          label="Dina försäljningar"
          body={data.me.sales.length + " annonser"}
          onPress={() => {
            router.navigate("/account/sales");
          }}
        />
      </View>
    </ScreenLayout>
  );
}
