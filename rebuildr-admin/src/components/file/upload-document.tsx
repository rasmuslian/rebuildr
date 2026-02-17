"use client";

import React from "react";
import { Upload, Button, App, UploadFile, UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";

type Props = {
  files: UploadFile[];
  setFiles: (fileList: UploadFile[]) => void;
  allowedFileNumber?: number;
};

const UploadDocument = ({
  files = [],
  setFiles,
  allowedFileNumber = 1,
}: Props) => {
  const { message } = App.useApp();
  const allowedTypes = ["application/pdf", "text/plain"];
  const canSelectMore = files.length < allowedFileNumber;

  const beforeUpload: UploadProps["beforeUpload"] = (file) => {
    if (!allowedTypes.includes(file.type)) {
      message.error("Bara PDF eller TXT-filer är tillåtna.");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handlePreview = (file: UploadFile) => {
    const url =
      file.url ||
      (file.originFileObj && URL.createObjectURL(file.originFileObj));

    if (url) {
      window.open(url, "_blank");
    } else {
      message.error("Kunde inte läsa filen.");
    }
  };

  return (
    <Upload
      beforeUpload={beforeUpload}
      onChange={({ fileList }) => setFiles(fileList)}
      fileList={files}
      accept=".pdf,.txt"
      multiple
      onPreview={handlePreview}
      listType="text"
    >
      {canSelectMore && (
        <Button icon={<UploadOutlined />} size="middle">
          Ladda upp dokument
        </Button>
      )}
    </Upload>
  );
};

export default UploadDocument;
