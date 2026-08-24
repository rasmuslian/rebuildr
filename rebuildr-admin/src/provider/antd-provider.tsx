"use client";

import React, { PropsWithChildren } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App, Empty } from "antd";
import { colors } from "tailwind.config";

const AntdProvider = ({ children }: PropsWithChildren) => {
  return (
    <ConfigProvider
      componentSize="large"
      checkbox={{
        style: {
          width: "fit-content",
        },
      }}
      renderEmpty={() => <Empty description="Inget att visa här 👀" />}
      theme={{
        token: {
          colorPrimary: colors.accent_500,
          colorText: colors.neutrals_900,
          colorError: colors.semantic_error_600,
          colorSuccess: colors.primary_600,
          fontFamily: "var(--font-inter)",
        },
        components: {
          Button: {
            primaryShadow: "none",
          },
          Menu: {
            itemHoverBg: colors.accent_500,
            itemHoverColor: colors.neutrals_100,
            itemSelectedBg: colors.accent_500,
            itemSelectedColor: colors.neutrals_100,
          },
          Spin: {
            colorPrimary: colors.accent_500,
          },
          Card: {
            borderRadiusLG: 12,
          },
          Table: {
            headerBg: colors.ghost,
            headerColor: colors.neutrals_600,
          },
          Tabs: {
            titleFontSize: 15,
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
