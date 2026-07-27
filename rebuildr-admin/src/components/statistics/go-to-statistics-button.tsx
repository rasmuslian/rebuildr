"use client";

import React from "react";
import { Button } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

const GoToStatisticsButton = () => {
  const router = useRouter();

  return (
    <Button
      type="link"
      icon={<ArrowRightOutlined />}
      iconPosition="end"
      onClick={() => router.push(routes.STATISTICS)}
    >
      Till statistik
    </Button>
  );
};

export default GoToStatisticsButton;
