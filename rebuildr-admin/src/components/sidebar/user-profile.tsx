"use client";

import React from "react";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Skeleton } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/queries/profile/get-profile";
import { queryKeys } from "@/lib/query-keys";

const UserProfile = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: [queryKeys.GET_PROFILE],
    queryFn: getProfile,
  });

  return (
    <div className="grid w-full grid-cols-[65px_auto] items-center gap-3 px-2 py-6">
      {isLoading ? (
        <>
          <Skeleton.Avatar active={true} size={65} />
          <Skeleton.Input active={true} />
        </>
      ) : (
        <>
          <Avatar
            src={profile?.profilePicture?.url}
            size={65}
            icon={<UserOutlined />}
          />

          <div className="flex flex-col overflow-hidden">
            <h4 className="truncate">{profile?.username}</h4>
            <p className="text-gray truncate">{profile?.email}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;
