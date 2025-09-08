"use client";

import React from "react";
import { Divider } from "antd";

type Props = {
  title?: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
};

const AdminForm = ({ title, onSubmit, children }: Props) => {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      {title && (
        <Divider orientation="start">
          <h3>{title}</h3>
        </Divider>
      )}

      {children}
    </form>
  );
};

export default AdminForm;
