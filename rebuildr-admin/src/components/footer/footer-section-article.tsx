import React from "react";
import { Article } from "gql/graphql";

type Props = {
  article: Article;
};

const FooterSectionArticle = ({ article }: Props) => {
  return (
    <div className="flex flex-row rounded bg-accent_100 p-3 shadow-md">
      <span>{article.title}</span>
    </div>
  );
};

export default FooterSectionArticle;
