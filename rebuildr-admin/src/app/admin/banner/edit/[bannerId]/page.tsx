import { notFound } from "next/navigation";
import { getBannerById } from "@/queries/banner/get-banner-by-id";
import EditBanner from "@/components/banner/edit-banner";

type Props = {
  params: Promise<{ bannerId: string }>;
};

const EditBannerPage = async ({ params }: Props) => {
  const { bannerId } = await params;
  const banner = await getBannerById(bannerId);

  if (!banner) notFound();

  return (
    <div className="flex max-w-screen-lg flex-col gap-5">
      <EditBanner banner={banner} />
    </div>
  );
};

export default EditBannerPage;
