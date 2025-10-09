"use client";

import React from "react";
import { Divider } from "antd";
import classNames from "classnames";

type Props = {
  title?: string;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  type?: "flat" | "raised";
  children: React.ReactNode;
};

const AdminForm = ({ title, onSubmit, type = "flat", children }: Props) => {
  return (
    <form onSubmit={onSubmit ?? undefined} className="flex flex-col gap-4">
      {title && <Divider orientation="start">{title}</Divider>}

      <div
        className={classNames("flex flex-1 flex-col gap-4", {
          "rounded bg-white p-4 shadow-md": type === "raised",
        })}
      >
        {children}
      </div>
    </form>
  );
};

export default AdminForm;
