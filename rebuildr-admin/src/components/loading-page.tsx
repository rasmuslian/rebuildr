import React from "react";
import { Spin } from "antd";

const LoadingPage = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spin size="large" />
    </div>
  );
};

export default LoadingPage;
