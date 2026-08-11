import { View } from "react-native";
import React, { useState, useCallback } from "react";
import {
  InternalAdsMenuContextQuery,
  MyAccountQuery,
  OrganizationMemberRoleEnum,
} from "@/gql/graphql";
import { Button } from "@components/buttons/button";
import { UserCard } from "@components/cards/user-card";
import { Divider } from "@components/dividers/divider";
import { LinkEntry } from "./link-entry";
import { router, useFocusEffect } from "expo-router";
import { gql, useQuery } from "@apollo/client";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { EditProfile } from "@components/profile/edit-profile";
import { isPurchaseDone } from "@/utils/purchases/purchases";
import { useLogout } from "@hooks/useLogout";
import { INTERNAL_ADS_MENU_CONTEXT } from "@/queries/internal-ads";

export const MY_ACCOUNT = gql`
  query MyAccount {
    me {
      id
      username
      type
      numberOfSoldProducts
      numberOfPublishedProducts
      rating
      products {
        id
      }
      projects {
        id
      }
      likedProducts {
        total
      }
      sales {
        id
      }
      purchases {
        id
        reportPurchase {
          resolution
        }
        approvedAt
        failedAt
      }
      profilePicture {
        id
        url
      }
    }
  }
`;

type AccountState = {
  page: "index" | "settings" | "organization-members";
  params?: Record<string, string | number>;
};

type Props = {
  onNavigation?: (state: AccountState) => void;
  onClose?: () => void;
};

export default function AccountContent({ onNavigation, onClose }: Props) {
  const [editMode, setEditMode] = useState(false);
  const { data, refetch } = useQuery<MyAccountQuery>(MY_ACCOUNT);
  const { data: internalAdsContextData } =
    useQuery<InternalAdsMenuContextQuery>(INTERNAL_ADS_MENU_CONTEXT);
  const { logout, loading: logoutLoading } = useLogout();
  const me = data?.me;
  const organizationContext =
    internalAdsContextData?.internalAdsOrganizationContext;
  const isOrganizationAdmin =
    organizationContext?.isOrganizationAccount ||
    organizationContext?.role === OrganizationMemberRoleEnum.Admin;

  const handleLogout = async () => {
    await logout();
    onClose?.();
  };

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  if (!me) return <LoadingSpinner />;

  if (editMode) {
    return <EditProfile onEditCompleted={() => setEditMode(false)} />;
  }

  const donePurchases = me.purchases.filter(isPurchaseDone);
  const ongoingPurchases = me.purchases.filter((p) => !isPurchaseDone(p));

  return (
    <View style={{ gap: 24 }}>
      <UserCard
        userType={me.type}
        profilePictureUrl={me.profilePicture?.url}
        username={me.username}
        numberOfPublishedProducts={me.numberOfPublishedProducts}
        numberOfSoldProducts={me.numberOfSoldProducts}
        rating={me.rating}
      />

      <View style={{ gap: 8 }}>
        <Button
          label="Se din profil"
          onPress={() => {
            router.navigate({
              pathname: "/account/profile",
              params: { userId: me.id },
            });
          }}
        />
      </View>
      <View style={{ gap: 16 }}>
        <Divider />
        <LinkEntry
          label="Dina projekt"
          body={(me.projects.length ?? 0) + " projekt"}
          link={{
            pathname: "/project-list/[userId]",
            params: { userId: me.id },
          }}
        />
        <LinkEntry
          label="Dina annonser"
          body={
            me.numberOfPublishedProducts +
            " annonser • " +
            me.numberOfSoldProducts +
            " sålda"
          }
          link={{
            pathname: "/product-list/[userId]",
            params: { userId: me.id },
          }}
        />
        <LinkEntry
          label="Dina försäljningar"
          body={me.sales.length + " annonser"}
          link="/account/sales"
        />
        <LinkEntry
          label="Dina köp"
          body={
            ongoingPurchases.length +
            " pågående • " +
            donePurchases.length +
            " avslutade"
          }
          link="/account/purchases"
        />
        <LinkEntry
          label="Dina favoriter"
          body={(me.likedProducts?.total ?? 0) + " annonser"}
          link="/account/favorites"
        />
        {isOrganizationAdmin && (
          <LinkEntry
            label="Organisationsmedlemmar"
            body="Hantera roller och inbjudningar"
            link={onNavigation ? undefined : "/account/organization-members"}
            onPress={
              onNavigation
                ? () => onNavigation({ page: "organization-members" })
                : undefined
            }
          />
        )}
        <LinkEntry
          label="Kontoinställningar"
          body="Hantera dina uppgifter och inställningar"
          link={onNavigation ? undefined : "/account/settings"}
          onPress={
            onNavigation ? () => onNavigation({ page: "settings" }) : undefined
          }
        />
      </View>
      <Button
        label="Logga ut"
        onPress={handleLogout}
        type="outlined"
        loading={logoutLoading}
      />
    </View>
  );
}
