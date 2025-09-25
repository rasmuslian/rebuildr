import React from "react";
import { useLocalSearchParams } from "expo-router";
import { ScreenLayout } from "@components/screen-layout/screen-layout";
import { Header } from "@components/navigation/headers/header";
import { gql, useQuery } from "@apollo/client";
import { GetArticleQuery, GetArticleQueryVariables } from "@/gql/graphql";
import ParsedArticle from "@components/article/parsed-article";

const GET_ARTICLE = gql`
  query GetArticle($articleId: String!) {
    article(id: $articleId) {
      id
      title
      body
    }
  }
`;

export default function PrintproductLabel() {
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

  return (
    <ScreenLayout
      loading={loading}
      headerComponent={<Header showBackButton title={title} />}
    >
      <ParsedArticle html={data?.article.body} />
    </ScreenLayout>
  );
}
