import React from "react";
import { useLocalSearchParams } from "expo-router";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { gql, useQuery } from "@apollo/client";
import { GetArticleQuery, GetArticleQueryVariables } from "@/gql/graphql";
import ParseHtml from "@components/article/parse-html";
import { useScreenType } from "@hooks/useScreenType";
import TopBar from "@components/navigation/top-bar/top-bar";
import { View } from "react-native";

const GET_ARTICLE = gql`
  query GetArticle($articleId: String!) {
    article(id: $articleId) {
      id
      title
      body
    }
  }
`;

export default function ArticlePage() {
  const { isDesktop } = useScreenType();
  const { articleId, title } = useLocalSearchParams<{
    articleId: string;
    title: string;
  }>();

  const { data, loading } = useQuery<GetArticleQuery, GetArticleQueryVariables>(
    GET_ARTICLE,
    {
      variables: {
        articleId,
      },
    },
  );

  if (isDesktop) {
    return (
      <ScreenLayout
        loading={loading}
        headerComponent={<TopBar theme="light" />}
      >
        <View style={{ width: 720, alignSelf: "center" }}>
          <ParseHtml html={data?.article.body} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      loading={loading}
      headerComponent={<Header showBackButton title={title} />}
    >
      <ParseHtml html={data?.article.body} />
    </ScreenLayout>
  );
}
