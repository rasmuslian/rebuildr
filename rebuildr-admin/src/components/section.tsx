import React from "react";
import { Divider } from "antd";

type Props = {
  title?: string;
  children: React.ReactNode;
};

const Section = ({ title, children }: Props) => {
  return (
    <div className="flex flex-col gap-4 rounded bg-white p-4 shadow-md">
      {title && (
        <Divider orientation="center" dashed style={{ margin: 0 }}>
          <span className="text-sm text-gray-500">{title}</span>
        </Divider>
      )}
      {children}
    </div>
  );
};

export default Section;
