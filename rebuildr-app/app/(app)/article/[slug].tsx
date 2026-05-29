import React from "react";
import { useLocalSearchParams } from "expo-router";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { gql, useQuery } from "@apollo/client";
import {
  GetArticleBySlugQuery,
  GetArticleBySlugQueryVariables,
} from "@/gql/graphql";
import ParseHtml from "@components/article/parse-html";
import { useScreenType } from "@hooks/useScreenType";
import TopBar from "@components/navigation/top-bar/top-bar";
import { View } from "react-native";
import CustomNotFound from "@/app/+not-found";
import { apolloIsNotFoundError } from "@/utils/apollo-errors";

const GET_ARTICLE_BY_SLUG = gql`
  query GetArticleBySlug($slug: String!) {
    articleBySlug(slug: $slug) {
      id
      title
      body
    }
  }
`;

export default function ArticlePage() {
  const { isDesktop } = useScreenType();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data, loading, error } = useQuery<
    GetArticleBySlugQuery,
    GetArticleBySlugQueryVariables
  >(GET_ARTICLE_BY_SLUG, {
    variables: { slug },
  });

  if (error && apolloIsNotFoundError(error)) {
    return <CustomNotFound />;
  }

  if (isDesktop) {
    return (
      <ScreenLayout
        loading={loading}
        headerComponent={<TopBar theme="light" />}
      >
        <View style={{ width: 720, alignSelf: "center", gap: 24 }}>
          <Header showBackButton title={data?.articleBySlug.title} />
          <ParseHtml html={data?.articleBySlug.body} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      loading={loading}
      headerComponent={
        <Header showBackButton title={data?.articleBySlug.title} />
      }
    >
      <ParseHtml html={data?.articleBySlug.body} />
    </ScreenLayout>
  );
}
