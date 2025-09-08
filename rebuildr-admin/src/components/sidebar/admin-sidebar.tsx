import React from "react";
import SidebarMenu from "@components/sidebar/sidebar-menu";
import UserProfile from "@components/sidebar/user-profile";

const AdminSidebar = () => {
  return (
    <div className="flex h-screen flex-col items-center overflow-auto border-r border-[rgba(5,5,5,0.06)] pb-16">
      <UserProfile />
      <SidebarMenu />
    </div>
  );
};

export default AdminSidebar;
