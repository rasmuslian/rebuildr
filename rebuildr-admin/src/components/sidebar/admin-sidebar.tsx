import React from "react";
import SidebarMenu from "@components/sidebar/sidebar-menu";
import UserProfile from "@components/sidebar/user-profile";

const AdminSidebar = () => {
  return (
    <div className="border-light flex h-screen flex-col items-center overflow-auto border-r pb-16">
      <UserProfile />
      <SidebarMenu />
    </div>
  );
};

export default AdminSidebar;
