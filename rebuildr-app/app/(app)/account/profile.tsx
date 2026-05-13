import { ProfileQuery, ProfileQueryVariables } from "@/gql/graphql";
import { useQuery } from "@apollo/client";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { useScreenType } from "@hooks/useScreenType";
import { useUser } from "@hooks/useUser";
import { PROFILE } from "queries";
import { LoadingSpinner } from "@components/loading-spinner/loading-spinner";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { ButtonProps, Button } from "@components/buttons/button";
import { UserCard } from "@components/cards/user-card";
import { CollapsableText } from "@components/collapsable-text/collapsable-text";
import { Divider } from "@components/dividers/divider";
import ProfileProducts from "@components/profile/profile-products";
import ProfileProjects from "@components/profile/profile-projects";
import ProfileReviews from "@components/profile/profile-reviews";
import { TabRail } from "@components/tabs/tab-rail";
import { View } from "react-native";
import { EditProfile } from "@components/profile/edit-profile";
import { SlideInSheet } from "@components/slide-in-sheet/slide-in-sheet";
import TopBar from "@components/navigation/top-bar/top-bar";
import RebuildrHead from "@components/meta-data/rebuildr-head";
import { CO2Summary } from "@components/profile/co2-summary";

export default function Profile() {
  const [tab, setTab] = useState<"products" | "reviewed" | "co2">("products");
  const [editMode, setEditMode] = useState(false);

  const { isDesktop } = useScreenType();
  const { isLoggedIn } = useUser();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [userCardKey, setUserCardKey] = useState(
    `user-card-${Date.now().toString()}`,
  );
  const [topBarKey, setTopBarKey] = useState(
    `top-bar-${Date.now().toString()}`,
  );

  const {
    data: profileData,
    loading: profileLoading,
    refetch,
  } = useQuery<ProfileQuery, ProfileQueryVariables>(PROFILE, {
    variables: { input: { id: userId }, isLoggedIn },
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  if (!profileData) return <LoadingSpinner />;

  const isMyProfile = profileData.me?.id === profileData.user.id;
  const user = profileData.user;

  const actionButtons: ButtonProps[] = [];
  if (isMyProfile) {
    actionButtons.push({
      icon: "edit",
      onPress: () => setEditMode(true),
    });
  }

  if (editMode && !isDesktop) {
    return (
      <ScreenLayout
        style={{ gap: 24, marginTop: 24 }}
        headerComponent={
          <Header title="Redigera profil" onBack={() => setEditMode(false)} />
        }
      >
        <EditProfile onEditCompleted={() => setEditMode(false)} />
      </ScreenLayout>
    );
  }

  if (isDesktop) {
    return (
      <>
        <RebuildrHead title="Profil" />

        <ScreenLayout
          style={{ marginTop: 48, gap: 24 }}
          desktopFooter
          headerComponent={<TopBar theme="light" key={topBarKey} />}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "column", gap: 24, maxWidth: 640 }}>
              <UserCard
                key={userCardKey}
                userType={user.type}
                profilePictureUrl={user.profilePicture?.url}
                username={user.username}
                numberOfPublishedProducts={user.numberOfPublishedProducts}
                numberOfSoldProducts={user.numberOfSoldProducts}
                rating={user.rating}
              />

              <CollapsableText
                text={user.description ?? ""}
                nrOfLines={2}
                readLess="Läs mindre"
                readMore="Läs hela beskrivningen"
              />
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              {actionButtons.map((actionButton, i) => (
                <Button key={i} type="text" {...actionButton} />
              ))}
            </View>
          </View>
          <Divider />

          <TabRail
            tabs={[
              {
                title: "Annonser",
                active: tab === "products",
                onActivate: () => setTab("products"),
              },
              {
                title: "Omdömen",
                active: tab === "reviewed",
                onActivate: () => setTab("reviewed"),
              },
              {
                title: "CO2 besparing",
                active: tab === "co2",
                onActivate: () => setTab("co2"),
              },
            ]}
          />
          {tab === "products" && (
            <>
              <ProfileProjects
                profileQuery={{ data: profileData, loading: profileLoading }}
              />
              <ProfileProducts
                isMyProfile={isMyProfile}
                profileQuery={{ data: profileData, loading: profileLoading }}
              />
            </>
          )}

          {tab === "reviewed" && (
            <ProfileReviews
              isMyProfile={isMyProfile}
              profileQuery={profileData}
            />
          )}

          {tab === "co2" && (
            <CO2Summary
              totalCO2Savings={profileData.user.totalCO2Savings}
              totalCO2SavingsBuyer={profileData.user.totalCO2SavingsBuyer}
              totalCO2SavingsSeller={profileData.user.totalCO2SavingsSeller}
              numberOfSoldProducts={profileData.user.numberOfSoldProducts}
              numberOfCompletedPurchases={
                profileData.user.numberOfCompletedPurchases
              }
            />
          )}
        </ScreenLayout>

        <SlideInSheet
          open={editMode}
          title="Redigera profil"
          onClose={() => setEditMode(false)}
        >
          <EditProfile
            onEditCompleted={() => {
              setEditMode(false);
              setUserCardKey(`user-card-${Date.now().toString()}`);
              setTopBarKey(`top-bar-${Date.now().toString()}`);
            }}
          />
        </SlideInSheet>
      </>
    );
  }

  return (
    <>
      <RebuildrHead title="Profil" />

      <ScreenLayout
        style={{ marginTop: 24, gap: 24 }}
        headerComponent={<Header ctas={actionButtons} />}
      >
        <UserCard
          userType={user.type}
          profilePictureUrl={user.profilePicture?.url}
          username={user.username}
          numberOfPublishedProducts={user.numberOfPublishedProducts}
          numberOfSoldProducts={user.numberOfSoldProducts}
          rating={user.rating}
        />

        <CollapsableText
          text={user.description ?? ""}
          nrOfLines={2}
          readLess="Läs mindre"
          readMore="Läs hela beskrivningen"
        />
        <Divider />
        <TabRail
          tabs={[
            {
              title: "Annonser",
              active: tab === "products",
              onActivate: () => setTab("products"),
            },
            {
              title: "Omdömen",
              active: tab === "reviewed",
              onActivate: () => setTab("reviewed"),
            },
            {
              title: "CO₂ besparing",
              active: tab === "co2",
              onActivate: () => setTab("co2"),
            },
          ]}
        />

        {tab === "products" && (
          <>
            <ProfileProjects
              profileQuery={{ data: profileData, loading: profileLoading }}
            />
            <ProfileProducts
              isMyProfile={isMyProfile}
              profileQuery={{ data: profileData, loading: profileLoading }}
            />
          </>
        )}

        {tab === "reviewed" && (
          <ProfileReviews
            isMyProfile={isMyProfile}
            profileQuery={profileData}
          />
        )}

        {tab === "co2" && (
          <CO2Summary
            totalCO2Savings={profileData.user.totalCO2Savings}
            totalCO2SavingsBuyer={profileData.user.totalCO2SavingsBuyer}
            totalCO2SavingsSeller={profileData.user.totalCO2SavingsSeller}
            numberOfSoldProducts={profileData.user.numberOfSoldProducts}
            numberOfCompletedPurchases={
              profileData.user.numberOfCompletedPurchases
            }
          />
        )}
      </ScreenLayout>
    </>
  );
}
