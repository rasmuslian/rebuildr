import React from "react";
import { Empty, Spin } from "antd";

type Props = {
  description?: string;
  size?: "small" | "large" | "default";
  spinner?: boolean;
};

const EmptyContainer = ({
  description = "",
  size = "large",
  spinner = false,
}: Props) => {
  return (
    <div className="m-auto flex justify-center">
      <Empty description={description}>{spinner && <Spin size={size} />}</Empty>
    </div>
  );
};

export default EmptyContainer;
