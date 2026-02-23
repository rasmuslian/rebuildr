import React from "react";
import SearchProducts from "@components/search/search-products";
import { permanentSection } from "@constants/permanent-sections";

export default function TrendingNowPage() {
  return <SearchProducts title={permanentSection.trendingNow.title} />;
}
