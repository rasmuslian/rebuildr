import React from "react";
import { Divider } from "antd";
import GoToStatisticsButton from "@/components/statistics/go-to-statistics-button";

const AdminPage = async () => {
  return (
    <div className="flex flex-col gap-6">
      <Divider orientation="start">
        <h3>Välkommen till Rebuildr admin</h3>
      </Divider>
      <div className="flex justify-end">
        <GoToStatisticsButton />
      </div>
    </div>
  );
};

export default AdminPage;
