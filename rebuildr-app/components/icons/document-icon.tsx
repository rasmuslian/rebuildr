import { Image } from "expo-image";
import DocumentPDF from "@assets/svgs/document-pdf.svg";
import DocumentTXT from "@assets/svgs/document-txt.svg";
import DocumentDOC from "@assets/svgs/document-doc.svg";

type Props = {
  mimeType: string;
  height?: number;
  width?: number;
};

export const DocumentIcon = ({ mimeType, height = 26, width = 20 }: Props) => {
  const type = mimeType.split("/")[1];

  switch (type) {
    case "pdf":
      return <Image source={DocumentPDF.uri} style={{ width, height }} />;
    case "plain":
      return <Image source={DocumentTXT.uri} style={{ width, height }} />;
    case "msword":
      return <Image source={DocumentDOC.uri} style={{ width, height }} />;
  }
  return null;
};
