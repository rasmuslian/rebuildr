export type FileType = {
  id?: string;
  index: number;
  uri: string;
  mimeType: string;
  file: File;
  size: number;
  name?: string | null;
};
