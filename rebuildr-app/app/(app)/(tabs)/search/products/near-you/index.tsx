import React from "react";
import SearchProducts from "@components/search/search-products";
import { permanentSection } from "@constants/permanent-sections";

export default function NearYouPage() {
  return <SearchProducts title={permanentSection.nearYou.title} showDistance />;
}
