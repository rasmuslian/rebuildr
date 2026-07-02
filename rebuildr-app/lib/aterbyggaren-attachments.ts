export type AterbyggarenPromptAttachment = {
  id: string;
  kind: "document" | "image";
  mimeType: string;
  name: string;
  uri?: string;
  url?: string;
};

export type AterbyggarenLocalAttachment = AterbyggarenPromptAttachment & {
  file: File;
};

export type AterbyggarenStreamAttachmentRef = {
  id: string;
  kind: "document" | "image";
};

type PreparedAterbyggarenAttachment = AterbyggarenPromptAttachment & {
  putUrl: string;
};

type PendingAterbyggarenChatInput = {
  attachments: AterbyggarenLocalAttachment[];
  question: string;
};

let pendingChatInput: PendingAterbyggarenChatInput | undefined;

export const createAterbyggarenAttachmentId = (kind: "document" | "image") =>
  `${kind}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const uploadAterbyggarenAttachments = async ({
  apiUrl,
  attachments,
  headers,
}: {
  apiUrl: string;
  attachments: AterbyggarenLocalAttachment[];
  headers: Record<string, string>;
}): Promise<{
  previews: AterbyggarenPromptAttachment[];
  streamAttachments: AterbyggarenStreamAttachmentRef[];
}> => {
  if (!attachments.length) return { previews: [], streamAttachments: [] };

  const response = await fetch(`${apiUrl}/aterbyggaren/attachments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({
      attachments: attachments.map((attachment) => ({
        kind: attachment.kind,
        mimeType: attachment.mimeType,
        name: attachment.name,
      })),
    }),
  });

  if (!response.ok) throw new Error("Kunde inte förbereda filuppladdningen.");

  const data = (await response.json()) as {
    attachments: PreparedAterbyggarenAttachment[];
  };

  await Promise.all(
    data.attachments.map(async (preparedAttachment, index) => {
      const attachment = attachments[index];
      if (!attachment) return;

      const uploadResponse = await fetch(preparedAttachment.putUrl, {
        method: "PUT",
        headers: {
          "Content-Type": attachment.mimeType,
        },
        body: attachment.file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Kunde inte ladda upp filen.");
      }
    }),
  );

  return {
    previews: data.attachments.map((preparedAttachment, index) => ({
      id: preparedAttachment.id,
      kind: preparedAttachment.kind,
      mimeType: preparedAttachment.mimeType,
      name: preparedAttachment.name ?? attachments[index]?.name ?? "Fil",
      uri: attachments[index]?.uri,
      url: preparedAttachment.url,
    })),
    streamAttachments: data.attachments.map((attachment) => ({
      id: attachment.id,
      kind: attachment.kind,
    })),
  };
};

export const setPendingAterbyggarenChatInput = (
  input: PendingAterbyggarenChatInput,
) => {
  pendingChatInput = input;
};

export const consumePendingAterbyggarenChatInput = () => {
  const input = pendingChatInput;
  pendingChatInput = undefined;
  return input;
};
