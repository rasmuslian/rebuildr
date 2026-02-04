import React from "react";
import { notFound } from "next/navigation";
import { getPartnerById } from "@/queries/partner/get-partner-by-id";
import EditPartner from "@/components/partner/edit-partner";

type Props = {
  params: Promise<{ partnerId: string }>;
};

const EditPartnerPage = async ({ params }: Props) => {
  const { partnerId } = await params;
  const partner = await getPartnerById({ id: partnerId });

  if (!partner) {
    notFound();
  }

  return (
    <div className="flex max-w-screen-lg flex-col gap-5">
      <EditPartner partner={partner} />
    </div>
  );
};

export default EditPartnerPage;
