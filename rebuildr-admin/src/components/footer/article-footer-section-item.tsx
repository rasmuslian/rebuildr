import React from "react";
import { ArticleFooterSection } from "gql/graphql";

type Props = {
  articleFooterSection: ArticleFooterSection;
};

const ArticleFooterSectionItem = ({ articleFooterSection }: Props) => {
  return (
    <div className="flex flex-row rounded bg-accent_100 p-2">
      <span>{articleFooterSection.article.title}</span>
    </div>
  );
};

export default ArticleFooterSectionItem;
