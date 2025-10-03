import React, { PropsWithChildren } from "react";
import AdminSidebar from "@components/sidebar/admin-sidebar";
import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

const AdminLayout = async ({ children }: PropsWithChildren) => {
  const session = await getSession();
  if (!session.isLoggedIn) redirect(routes.LOGIN);

  return (
    <div className="grid grid-cols-[256px_auto]">
      <AdminSidebar />
      <div className="relative flex h-screen min-w-[720px] flex-grow flex-col overflow-y-auto bg-ghost p-4 pb-20">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
