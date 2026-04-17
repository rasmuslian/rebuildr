import type { UploadFile } from "antd";
import { RcFile } from "antd/es/upload";
import { FileInputType, File } from "gql/graphql";
import { map, difference } from "lodash";

export const getRemovedFileIds = (
  initialFiles: File[],
  currentFiles: UploadFile[],
) => {
  const initialIds = map(initialFiles, "id");
  const currentIds = map(currentFiles, "uid");
  const removedFiles = difference(initialIds, currentIds);
  return removedFiles;
};

export const getUploadFiles = (files: File[]) => {
  return files.map((file) => {
    const now = new Date().toISOString();
    return {
      uid: file.id,
      name: file.name || now,
      url: file.url,
      status: "done",
    } as UploadFile;
  });
};

export const getFileInputTypes = (fileList: UploadFile[]) => {
  const addImages: FileInputType[] = [];

  fileList.forEach((file) => {
    if (file.originFileObj) {
      addImages.push({
        mimeType: file.originFileObj.type,
        name: file.name,
      });
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
