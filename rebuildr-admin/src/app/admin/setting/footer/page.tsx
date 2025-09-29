import React from "react";
import CreateFooterSection from "@/components/footer/create-footer-section";
import ListFooterSections from "@/components/footer/list-footer-sections";

const FooterSetting = () => {
  return (
    <div className="flex max-w-screen-lg flex-col gap-5">
      <CreateFooterSection />
      <ListFooterSections />
    </div>
  );
};

export default FooterSetting;
