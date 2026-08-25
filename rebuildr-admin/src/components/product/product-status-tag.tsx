import { Tag } from "antd";

/**
 * Swedish status labels for listings. Shared so statistics tables and the
 * product list never drift apart on wording or colour.
 */
const ProductStatusTag = ({ status }: { status: string | null }) => {
  if (!status) return null;

  switch (status.toUpperCase()) {
    case "PUBLISHED":
      return <Tag color="blue">Publicerad</Tag>;
    case "SOLD":
      return <Tag color="green">Såld</Tag>;
    case "DELETED":
      return <Tag color="red">Raderad</Tag>;
    case "DRAFT":
      return <Tag color="gold">Utkast</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

export default ProductStatusTag;
