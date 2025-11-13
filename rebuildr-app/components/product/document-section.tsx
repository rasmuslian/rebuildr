import { Button } from "@components/buttons/button";
import { Body, Label, Title } from "@components/typography/text";
import { borderRadius } from "@constants/sizes";
import { useThemeColor } from "@hooks/useThemeColor";
import { Icon } from "@icons/icon";
import { useState } from "react";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { FileType } from "../upsert-product/types";
import { useDocumentHandler } from "@hooks/use-document-handler";

type Props = {
  documents: FileType[];
  onUpdateFiles: (updatedFiles: FileType[]) => void;
};

const MAX_TOTAL_BYTES = 20000000;

export const DocumentSection = ({ documents, onUpdateFiles }: Props) => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const { pickDocument } = useDocumentHandler();
  const colors = useThemeColor();

  const getTotalSize = () => {
    const total = documents.reduce((acc, curr) => acc + curr.size, 0);

    const totalInMB = Math.round(total / 1000000);
    return totalInMB;
  };

  const getDocumentName = (document: FileType) => {
    if (document.name) {
      return document.name;
    }

    return `[NO NAME].${document.mimeType.split("/")[1]}`;
  };

  const selectDocument = async () => {
    setSizeError(false);
    setUploadError(null);

    try {
      const document = await pickDocument();
      if (!document) return;

      const total =
        documents.reduce((acc, curr) => acc + curr.size, 0) + document.size;
      if (total > MAX_TOTAL_BYTES) {
        setSizeError(true);
        return;
      }
      onUpdateFiles([
        ...documents,
        {
          uri: document.uri,
          index: documents.length,
          mimeType: document.mimeType,
          file: document.file,
          size: document.size,
          name: document.name,
        },
      ]);
    } catch {
      setUploadError("Något gick fel vid uppladdning av dokument");
    }
  };

  const removeDocument = (index: number) => {
    const updateDocuments = documents.reduce((acc: FileType[], curr) => {
      if (curr.index < index) {
        return [...acc, curr];
      }

      if (curr.index === index) {
        return acc;
      }

      return [...acc, { ...curr, index: curr.index - 1 }];
    }, []);
    onUpdateFiles(updateDocuments);
  };

  return (
    <View
      style={{
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderColor: colors.dividers.neutral,
      }}
    >
      <View style={{ gap: 4, marginBottom: 12 }}>
        <Label size="medium">Dokument</Label>
        <Body size="small">
          Ladda upp dokument som hjälper köparen att förstå produkten, t.ex.
          manualer, certifikat eller tekniska specifikationer.
        </Body>
      </View>
      <Pressable onPress={() => selectDocument()}>
        <View
          style={{
            borderColor: colors.buttons.outlinedStroke.enabled,
            borderWidth: 1,
            borderRadius: borderRadius.medium,
            borderStyle: "dashed",
            padding: 16,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              backgroundColor: colors.card.message,
              borderRadius: 38,
              marginBottom: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon="addFile" size={24} />
          </View>
          <Title size="medium" style={{ marginBottom: 4 }}>
            Ladda upp dokument
          </Title>
          <Body size="small">Tryck för att ladda upp filer här.</Body>
        </View>
      </Pressable>
      <Body
        size="small"
        color={sizeError ? "error" : "secondary"}
        style={{ marginTop: 12 }}
      >
        {documents.length} Dokument ({getTotalSize()} MB av 20 MB)
      </Body>
      {uploadError && (
        <Body size="small" color="error" style={{ marginTop: 4 }}>
          {uploadError}hej
        </Body>
      )}
      <View style={{ gap: 16, marginTop: 16 }}>
        {documents.map((document, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Body size="medium">{getDocumentName(document)}</Body>
            <Button
              label="Ta bort"
              onPress={() => removeDocument(i)}
              type="tonal"
            />
          </View>
        ))}
      </View>
    </View>
  );
};
