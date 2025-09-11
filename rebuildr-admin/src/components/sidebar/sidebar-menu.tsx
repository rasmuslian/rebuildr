"use client";

import React from "react";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "@/actions/auth";

import {
  HomeOutlined,
  LogoutOutlined,
  FileImageOutlined,
} from "@ant-design/icons";

type MenuItem = Required<MenuProps>["items"][number];

const SidebarMenu = () => {
  const router = useRouter();
  const pathname = usePathname();

  const onLogout = async () => {
    try {
      const response = await logout();
      if (!response.ok) throw new Error("Failed to logout!");

      const { success } = await response.json();
      if (success) router.refresh();
    } catch (error) {
      console.error("Failed to logout :>> ", error);
    }
  };

  const getItem = (
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
  ): MenuItem => {
    return {
      key,
      icon,
      label,
      children,
      onClick: () => {
        if (!children) router.push(key.toString());
      },
    };
  };

  const items: MenuItem[] = [
    { type: "divider" },
    getItem("Översikt", "/admin", <HomeOutlined />),
    { type: "divider" },
    getItem("Bildbank", "/media/mdeia", <FileImageOutlined />),
    { type: "divider" },
    {
      label: "Logga ut",
      key: "logout",
      icon: <LogoutOutlined />,
      onClick: async () => await onLogout(),
    },
  ];

  return (
    <Menu
      style={{ width: 256 }}
      defaultSelectedKeys={[pathname]}
      defaultOpenKeys={[pathname]}
      mode="inline"
      items={items}
    />
  );
};

export default SidebarMenu;
