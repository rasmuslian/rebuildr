import React, { PropsWithChildren } from "react";
import AdminSidebar from "@components/sidebar/admin-sidebar";

const AdminLayout = async ({ children }: PropsWithChildren) => {
  return (
    <div className="grid grid-cols-[256px_auto]">
      <AdminSidebar />
      <div className="bg-ghost flex h-screen min-w-[720px] flex-grow flex-col overflow-y-auto p-4 pb-20">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
