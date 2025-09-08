import React from "react";
import { Result } from "antd";

const NotFoundPage = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center p-3">
      <Result
        style={{ justifyItems: "center" }}
        status="warning"
        title="Sidan kunde inte hittas"
        subTitle="Den sida du letar efter finns inte."
      />
    </div>
  );
};

export default NotFoundPage;
