import React from "react";

import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";

type Props = {
  placeholder?: string;
  defaultValue?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
};

const SearchField = ({ placeholder, defaultValue, onChange }: Props) => {
  return (
    <Input
      prefix={<SearchOutlined />}
      name="search"
      type="text"
      size="large"
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={onChange}
      allowClear
    />
  );
};

export default SearchField;
