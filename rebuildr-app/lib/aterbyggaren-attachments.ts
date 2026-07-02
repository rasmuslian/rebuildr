export type AterbyggarenPromptAttachment = {
  id: string;
  kind: "document" | "image";
  mimeType: string;
  name: string;
  uri?: string;
};

export type AterbyggarenLocalAttachment = AterbyggarenPromptAttachment & {
  file: File;
};

export type AterbyggarenStreamAttachment = {
  data: string;
  kind: "document" | "image";
  mimeType: string;
  name?: string;
};

type PendingAterbyggarenChatInput = {
  attachments: AterbyggarenLocalAttachment[];
  question: string;
};

let pendingChatInput: PendingAterbyggarenChatInput | undefined;

export const createAterbyggarenAttachmentId = (kind: "document" | "image") =>
  `${kind}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Kunde inte läsa filen."));
        return;
      }
      resolve(result.split(",")[1] ?? result);
    };
    reader.readAsDataURL(file);
  });

export const prepareAterbyggarenStreamAttachments = async (
  attachments: AterbyggarenLocalAttachment[],
): Promise<AterbyggarenStreamAttachment[]> => {
  return Promise.all(
    attachments.map(async (attachment) => ({
      data: await fileToBase64(attachment.file),
      kind: attachment.kind,
      mimeType: attachment.mimeType,
      name: attachment.name,
    })),
  );
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
