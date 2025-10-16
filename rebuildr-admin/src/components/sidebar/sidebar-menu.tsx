"use client";

import React from "react";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import { routes } from "@/lib/routes";
import { useMutation } from "@tanstack/react-query";

import {
  HomeOutlined,
  LogoutOutlined,
  FileImageOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  InboxOutlined,
  ProductOutlined,
  ProjectOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

type MenuItem = Required<MenuProps>["items"][number];

const SidebarMenu = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { mutate: onLogout, isPending } = useMutation({
    mutationFn: async () => {
      const { success } = await logout();
      if (!success) throw new Error();
      return success;
    },
    onSuccess: async () => {
      router.push(routes.LOGIN);
    },
    onError: () => {
      console.error("Failed to logout");
    },
  });

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
      disabled: isPending,
      onClick: () => {
        if (!children) router.push(key.toString());
      },
    };
  };

  const items: MenuItem[] = [
    { type: "divider" },
    getItem("Översikt", "/admin", <HomeOutlined />),
    { type: "divider" },
    getItem("Produkter", "/product", <ProductOutlined />, [
      getItem("Skapa product", routes.CREATE_PRODUCT),
      getItem("Visa alla produkter", routes.LIST_PRODUCT),
    ]),
    { type: "divider" },
    getItem("Projekter", "/project", <ProjectOutlined />, [
      getItem("Skapa projekt", routes.CREATE_PROJECT),
      getItem("Visa alla projekter", routes.LIST_PROJECT),
    ]),
    { type: "divider" },
    getItem("Kategorier", routes.LIST_CATEGORY, <InboxOutlined />),
    { type: "divider" },
    getItem("Bildbank", routes.MEDIA_BANK, <FileImageOutlined />),
    { type: "divider" },
    getItem("Artiklar", "/article", <FolderOpenOutlined />, [
      getItem("Skapa artikel", routes.CREATE_ARTICLE),
      getItem("Visa alla artiklar", routes.LIST_ARTICLE),
    ]),
    { type: "divider" },
    getItem("Inställningar", "/setting", <SettingOutlined />, [
      getItem("Sidfot", routes.FOOTER_SETTING),
    ]),
    { type: "divider" },
    {
      label: "Logga ut",
      key: "logout",
      icon: isPending ? <LoadingOutlined /> : <LogoutOutlined />,
      onClick: () => onLogout(),
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
