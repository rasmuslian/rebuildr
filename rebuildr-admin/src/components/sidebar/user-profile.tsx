"use client";

import React from "react";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/queries/profile/get-profile";

const UserProfile = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  return (
    <div className="grid w-full grid-cols-[65px_auto] items-center gap-3 px-2 py-6">
      <Avatar
        src={profile?.profilePicture?.url}
        size={65}
        icon={<UserOutlined />}
      />
      {isLoading ? (
        <Spin size="small" />
      ) : (
        <div className="flex flex-col overflow-hidden">
          <h4 className="truncate">{profile?.username}</h4>
          <p className="truncate text-gray-500">{profile?.email}</p>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
