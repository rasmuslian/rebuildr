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
  UserOutlined,
  TagOutlined,
  TeamOutlined,
  FilePdfOutlined,
  MessageOutlined,
  ShoppingCartOutlined,
  PictureOutlined,
  BarChartOutlined,
  MailOutlined,
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
    getItem("Projekt", "/project", <ProjectOutlined />, [
      getItem("Skapa projekt", routes.CREATE_PROJECT),
      getItem("Visa alla projekt", routes.LIST_PROJECT),
    ]),

    { type: "divider" },
    getItem("Kategorier", "/category", <InboxOutlined />, [
      getItem("Skapa kategori", routes.CREATE_CATEGORY),
      getItem("Visa alla kategorier", routes.LIST_CATEGORY),
      getItem("CO2", routes.CATEGORY_CO2),
    ]),

    { type: "divider" },
    getItem("Varumärken", "/brand", <TagOutlined />, [
      getItem("Skapa varumärke", routes.CREATE_BRAND),
      getItem("Visa alla varumärken", routes.LIST_BRAND),
    ]),

    { type: "divider" },
    getItem("Partners", "/partner", <TeamOutlined />, [
      getItem("Skapa partner", routes.CREATE_PARTNER),
      getItem("Visa alla partners", routes.LIST_PARTNER),
    ]),
    { type: "divider" },
    getItem("Banners", "/banner", <PictureOutlined />, [
      getItem("Skapa banner", routes.CREATE_BANNER),
      getItem("Visa alla banners", routes.LIST_BANNER),
    ]),

    { type: "divider" },
    getItem("Nyhetsbrev & tävling", routes.NEWSLETTER_COMPETITION, <MailOutlined />),

    { type: "divider" },
    getItem("Köp", routes.LIST_PURCHASE, <ShoppingCartOutlined />),

    { type: "divider" },
    getItem(
      "Systemmeddelanden",
      routes.LIST_SYSTEM_MESSAGES,
      <MessageOutlined />,
    ),

    { type: "divider" },
    getItem("Användare", routes.LIST_USER, <UserOutlined />),

    { type: "divider" },
    getItem("Bildbibliotek", routes.Image_Library, <FileImageOutlined />),

    { type: "divider" },
    getItem("Dokumentbibliotek", routes.Document_Library, <FilePdfOutlined />),

    { type: "divider" },
    getItem("Artiklar", "/article", <FolderOpenOutlined />, [
      getItem("Skapa artikel", routes.CREATE_ARTICLE),
      getItem("Visa alla artiklar", routes.LIST_ARTICLE),
    ]),

    { type: "divider" },
    getItem("Statistik", routes.STATISTICS, <BarChartOutlined />),

    { type: "divider" },
    getItem("Inställningar", "/setting", <SettingOutlined />, [
      getItem("Sidfot", routes.FOOTER_SETTING),
      getItem("Sidor", routes.LIST_PAGE_CONTENT),
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
