import type { UploadFile } from "antd";
import { RcFile } from "antd/es/upload";
import { FileInputType, File } from "gql/graphql";

export const getUploadFiles = (files: File[]) => {
  return files.map((file) => {
    const now = new Date().toISOString();
    return {
      uid: file.id,
      name: file.name || now,
      url: file.url,
    } as UploadFile;
  });
};

export const getFileInputTypes = (fileList: UploadFile[]) => {
  const addImages: FileInputType[] = [];

  fileList.map((file) => {
    const mimeType = file.type;
    const name = file.name;

    if (mimeType) {
      addImages.push({ mimeType, name });
    }
  });

  return addImages;
};

export const uploadFiles = async (
  presignedPutUrls: string[],
  fileList: UploadFile[],
) => {
  const files: { file: RcFile; index: number }[] = [];
  fileList.map((file, index) => {
    if (file.originFileObj) {
      files.push({ file: file.originFileObj, index: index });
    }
  });

  const responses = await Promise.all(
    files.map(async (file) => {
      return await fetch(presignedPutUrls[file.index], {
        method: "PUT",
        headers: {
          "Content-Type": file.file.type,
          "x-amz-acl": "public-read",
        },
        body: file.file,
      });
    }),
  );

  const allOk = responses.every((res) => res.ok);

  if (!allOk) {
    console.error("One or more file uploads failed");
  }

  return allOk;
};
