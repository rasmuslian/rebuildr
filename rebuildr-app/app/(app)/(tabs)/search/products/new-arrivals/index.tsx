import React from "react";
import SearchProducts from "@components/search/search-products";
import { permanentSection } from "@constants/permanent-sections";

export default function NewArrivalsPage() {
  return <SearchProducts title={permanentSection.newArrivals.title} />;
}
