"use client";

import React, { useState, Fragment } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Image, Upload, GetProp, UploadFile, UploadProps } from "antd";
import ImgCrop from "antd-img-crop";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

type Props = {
  aspect?: number;
  aspectSlider?: boolean;
  files: UploadFile[];
  setFiles: (fileList: UploadFile[]) => void;
  allowedFileNumber?: number;
};

const getBase64 = (file: FileType): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const UploadMedia = ({
  aspect = 1,
  aspectSlider = false,
  files = [],
  setFiles,
  allowedFileNumber = 1,
}: Props) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const canSelectMore = files.length < allowedFileNumber;

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: files }) => {
    setFiles(files);
  };

  return (
    <Fragment>
      <ImgCrop
        key={aspect}
        aspect={aspect}
        aspectSlider={aspectSlider}
        modalTitle="Beskär bild"
        modalWidth={800}
        showGrid
      >
        <Upload
          accept=".jpeg, .jpg, .webp, .png"
          listType="picture-card"
          fileList={files}
          onPreview={handlePreview}
          onChange={handleChange}
        >
          {canSelectMore && <PlusOutlined />}
        </Upload>
      </ImgCrop>

      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          alt="Preview"
          src={previewImage}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
        />
      )}
    </Fragment>
  );
};

export default UploadMedia;
