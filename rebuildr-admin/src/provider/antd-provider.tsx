"use client";

import React, { PropsWithChildren } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App } from "antd";

const AntdProvider = ({ children }: PropsWithChildren) => {
  return (
    <ConfigProvider
      componentSize="large"
      theme={{
        token: {
          colorPrimary: "#863CFF",
          colorText: "#212121",
          fontFamily: "var(--font-inter)",
        },
        components: {
          Button: {
            primaryShadow: "none",
          },
          Menu: {
            itemHoverBg: "#863CFF",
            itemHoverColor: "#ffffff",
            itemSelectedBg: "#863CFF",
            itemSelectedColor: "#ffffff",
          },
          Tree: {
            nodeHoverBg: "#ffc9b5",
            nodeSelectedBg: "#ffc9b5",
            nodeSelectedColor: "#f1542a",
          },
          Result: {
            colorTextHeading: "#1D2122",
            colorTextDescription: "#64747A",
          },
          Spin: {
            colorPrimary: "#863CFF",
          },
        },
      }}
    >
      <App notification={{ placement: "bottomRight", duration: 4 }}>
        <AntdRegistry>{children}</AntdRegistry>
      </App>
    </ConfigProvider>
  );
};

export default AntdProvider;
