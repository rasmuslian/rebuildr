import React from "react";
import { Result } from "antd";
import { ResultStatusType } from "antd/es/result";

type Props = {
  status: ResultStatusType;
  title: string;
  subTitle: string;
};

const ForbiddenPage = ({ title, subTitle, status }: Props) => {
  return (
    <Result
      style={{ margin: "auto" }}
      status={status}
      title={title}
      subTitle={subTitle}
    />
  );
};

export default ForbiddenPage;
