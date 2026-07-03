import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FilePart,
  FinishReason,
  ImagePart,
  ModelMessage,
  Output,
  generateText,
  stepCountIs,
  streamText,
  tool,
} from 'ai';
import { Request, Response } from 'express';
import { z } from 'zod';

import { AuthedUserType } from 'src/auth/constants';
import { AterbyggarenChat } from 'src/entities/aterbyggaren-chat.entity';
import {
  AterbyggarenProductDisplay,
  AterbyggarenMessage,
  AterbyggarenMessageRole,
  AterbyggarenMessageStatus,
} from 'src/entities/aterbyggaren-message.entity';
import { File } from 'src/entities/file.entity';
import { Product, ProductStatus } from 'src/entities/product.entity';
import {
  OrderProductsEnum,
  ProductsInput,
} from 'src/resolvers/product.resolver';
import { FileService } from 'src/services/file.service';
import { ProductService } from 'src/services/product.service';
import { In, IsNull, Repository } from 'typeorm';

const MAX_MESSAGE_LENGTH = 4_000;
const MAX_ATTACHMENT_COUNT = 4;
const MAX_CONTEXT_MESSAGES = 16;
const MAX_CONTEXT_LOOKBACK_MESSAGES = MAX_CONTEXT_MESSAGES * 4;
const MAX_OUTPUT_TOKENS = 3_200;
const MAX_TITLE_LENGTH = 46;
const TITLE_GENERATION_TIMEOUT_MS = 4_000;
const STREAM_ERROR_MESSAGE =
  'Återbyggaren kunde inte svara just nu. Försök igen om en stund.';
const STREAM_INTERRUPTED_MESSAGE =
  'Svaret avbröts innan det blev klart. Ställ gärna frågan igen om du vill fortsätta.';
const STREAM_LENGTH_LIMIT_MESSAGE =
  'Jag nådde längdgränsen för svaret. Ställ gärna en följdfråga om du vill att jag fortsätter eller fördjupar en del.';

const chatTitleSchema = z.object({
  title: z.string().min(1).max(MAX_TITLE_LENGTH),
});

export interface AterbyggarenChatSummary {
  id: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AterbyggarenMessageResponse {
  attachments?: AterbyggarenMessageAttachmentResponse[];
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  productDisplays?: AterbyggarenProductDisplay[] | null;
}

export interface AterbyggarenMessageAttachmentResponse {
  id: string;
  kind: 'document' | 'image';
  mimeType: string;
  name?: string;
  url: string;
}

interface ChatOwner {
  user?: AuthedUserType;
  guestId?: string;
}

interface SendMessageInput {
  attachments?: AterbyggarenStreamAttachmentRef[];
  chatId?: string;
  message: string;
  guestId?: string;
}

interface PrepareAttachmentsInput {
  attachments?: AterbyggarenAttachmentInput[];
}

interface AterbyggarenAttachmentInput {
  kind: 'document' | 'image';
  mimeType: string;
  name?: string;
}

interface AterbyggarenStreamAttachmentRef {
  id: string;
  kind: 'document' | 'image';
}

type AttachmentValidationResult =
  | { valid: true; items: AterbyggarenStreamAttachmentRef[] }
  | { valid: false; message: string };

type PreparedAterbyggarenAttachment = Omit<
  AterbyggarenMessageAttachmentResponse,
  'url'
> & {
  putUrl: string;
};

interface AterbyggarenStreamAttachmentFile {
  file: File;
  kind: 'document' | 'image';
}

interface SearchPublicProductsInput {
  query: string;
  limit?: number;
  maxPrice?: number;
  onlyGiveaways?: boolean;
}

interface PublicProductSearchResult {
  id: string;
  title: string;
  description?: string;
  price: number;
  isGiveaway: boolean;
  condition: Product['condition'];
  category?: string;
  brand?: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  likedByMe?: boolean | null;
  url: string;
  imageUrl?: string;
}

@Injectable()
export class AterbyggarenService {
  private readonly logger = new Logger(AterbyggarenService.name);

  private google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  private readonly systemPrompt = `
Du är Återbyggaren, RebuildRs svenska AI-assistent för bygg, renovering, återbruk och hemmafix.

Svara alltid på svenska. Var praktisk, lugn, tydlig och konkret. Hjälp användaren att bryta ner projekt i steg, material, verktyg, risker och nästa rimliga beslut.

Viktiga gränser:
- Uppmana användaren att anlita eller rådfråga behörig fackperson vid el, VVS, bärande konstruktioner, taksäkerhet, brandskydd, asbest, mögel, farliga material, tillstånd och arbeten där fel kan orsaka personskada eller stora skador.
- Gissa inte om lagkrav eller dimensionering. Säg när något behöver kontrolleras lokalt eller av sakkunnig.
- Du får aldrig skriva, ändra, reservera, köpa, sälja, kontakta säljare eller på annat sätt mutera data i RebuildR.
- Du får bara använda verktyg för att läsa publikt synliga produktannonser.

Nytt arbetsflöde för projektfrågor:
- När användaren beskriver ett byggprojekt, börja med kort vägledning och skapa sedan en Materiallista innan du söker produkter. Gissa rimliga standardmått och mängder när användaren inte gett exakta mått, men säg att listan är ett första utkast.
- Efter materiallistan ska du lägga en egen rad med exakt format <rebuildr-material-list title="Rubrik" items="Etikett::sökfras|Etikett::sökfras" />. Exempel: <rebuildr-material-list title="Klassisk altan med trall" items="Trall 28 mm, 30 m2::trall 28 mm|Trallskruv 13 mm, 300 st::trallskruv|Stolpar 120 mm, 6 m::stolpar 120" />.
- Skriv inte att du redan har sökt RebuildR i detta första steg. UI:t låter användaren välja Sök markerade eller Sök alla efteråt.

När användaren uttryckligen ber dig söka, hitta, kontrollera tillgänglighet eller frågar om RebuildR har en viss produkt, måste du anropa searchPublicProducts innan du svarar om tillgänglighet. Det gäller även uppföljningar som börjar med "Sök på RebuildR efter dessa material från materiallistan". Vid flera materialtyper: sök separat för varje relevant typ, gruppera resultatet under korta rubriker som "Trall", "Skruv" och "Stolpar", och skriv produktkortstaggen direkt efter respektive rubrik.

När searchPublicProducts returnerar produkter och du vill visa en eller flera av dem som riktiga produktkort, skriv en egen rad med exakt format <rebuildr-products ids="id1,id2,id3" />. Använd bara id:n som verktyget nyss returnerade. Välj bara de mest relevanta produkterna, och visa gärna en enda produkt om bara en träff är riktigt bra. Skriv inte produktkortet själv i text.

Formatera gärna med Markdown, korta rubriker, punktlistor och tabeller när det gör svaret mer lättläst.`;

  constructor(
    @InjectRepository(AterbyggarenChat)
    private chatRepository: Repository<AterbyggarenChat>,
    @InjectRepository(AterbyggarenMessage)
    private messageRepository: Repository<AterbyggarenMessage>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private productService: ProductService,
    private fileService: FileService,
  ) {}

  async listChats(user?: AuthedUserType): Promise<AterbyggarenChatSummary[]> {
    if (!user) return [];

    return this.chatRepository.find({
      where: { userId: user.id, deletedAt: IsNull() },
      order: { updatedAt: 'DESC' },
      take: 50,
    });
  }

  async getMessages(
    chatId: string,
    user?: AuthedUserType,
  ): Promise<AterbyggarenMessageResponse[]> {
    if (!user) return [];

    const chat = await this.getOwnedChat(chatId, { user });
    if (!chat) return [];

    const messages = await this.messageRepository.find({
      where: { chatId: chat.id },
      order: { createdAt: 'ASC' },
    });

    return Promise.all(
      messages.map((message) => this.toMessageResponse(message, user.id)),
    );
  }

  async deleteChat(chatId: string, user?: AuthedUserType) {
    if (!user) {
      throw new ForbiddenException('Logga in för att ta bort chattar');
    }

    const chat = await this.getOwnedChat(chatId, { user });
    if (!chat) {
      throw new BadRequestException('Chatten kunde inte hittas');
    }

    chat.deletedAt = new Date();
    await this.chatRepository.save(chat);
    return { ok: true };
  }

  async prepareAttachments(
    input: PrepareAttachmentsInput,
  ): Promise<{ attachments: PreparedAterbyggarenAttachment[] }> {
    const validation = this.validateAttachmentInputs(input.attachments);
    if (validation.valid === false) {
      throw new BadRequestException(validation.message);
    }

    const files = await this.fileService.createFiles(
      validation.items.map((attachment) => ({
        mimeType: attachment.mimeType,
        name: attachment.name,
      })),
      true,
    );
    const putUrls = await this.fileService.uploadFiles(files);

    return {
      attachments: files.map((file, index) => ({
        id: file.id,
        kind: validation.items[index].kind,
        mimeType: file.mimeType,
        name: file.name,
        putUrl: putUrls[index],
      })),
    };
  }

  async streamMessage(
    input: SendMessageInput,
    owner: ChatOwner,
    request: Request,
    response: Response,
  ) {
    const userMessage = input.message?.trim();
    if (!userMessage) {
      response.status(400).json({ message: 'Meddelandet saknas' });
      return;
    }
    if (userMessage.length > MAX_MESSAGE_LENGTH) {
      response.status(400).json({ message: 'Meddelandet är för långt' });
      return;
    }
    const attachmentRefs = this.validateAttachmentRefs(input.attachments);
    if (attachmentRefs.valid === false) {
      response.status(400).json({ message: attachmentRefs.message });
      return;
    }
    const attachments = await this.getStreamAttachments(attachmentRefs.items);

    const { chat, created } = await this.getOrCreateChat({
      chatId: input.chatId,
      titleSeed: userMessage,
      owner,
    });

    response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders?.();

    const abortController = new AbortController();
    const abortStream = () => abortController.abort();
    request.on('close', abortStream);

    this.writeEvent(response, 'chat', {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    });

    let savedUserMessage: AterbyggarenMessage | undefined;
    let assistantMessage = '';
    let assistantSaved = false;
    let titleGeneration: Promise<void> | undefined;
    const searchableProductsById = new Map<string, PublicProductSearchResult>();

    try {
      savedUserMessage = await this.messageRepository.save({
        chatId: chat.id,
        role: AterbyggarenMessageRole.USER,
        status: AterbyggarenMessageStatus.COMPLETE,
        content: userMessage,
      });

      await this.attachFilesToMessage(savedUserMessage, attachments);

      if (created) {
        titleGeneration = this.generateAndSaveChatTitle({
          chatId: chat.id,
          placeholderTitle: chat.title,
          userMessage,
          response,
        });
      }

      const contextMessages = this.withCurrentAttachments(
        await this.getContextMessages(chat.id, savedUserMessage.id),
        await this.getModelAttachmentParts(attachments),
      );

      const result = streamText({
        model: this.google('gemini-2.5-flash'),
        system: this.systemPrompt,
        messages: contextMessages,
        abortSignal: abortController.signal,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.35,
        stopWhen: stepCountIs(4),
        tools: {
          searchPublicProducts: tool({
            description:
              'Sök efter publika RebuildR-annonser när användaren explicit valt att söka internt, kontrollera tillgänglighet eller hitta produkter. Verktyget är strikt read-only och returnerar bara publikt synliga produktfält.',
            inputSchema: z.object({
              query: z
                .string()
                .min(1)
                .describe(
                  'Sökfras, till exempel tegel, innerdörr eller fönster.',
                ),
              limit: z
                .number()
                .int()
                .min(1)
                .max(8)
                .optional()
                .describe('Max antal annonser att returnera.'),
              maxPrice: z
                .number()
                .min(0)
                .optional()
                .describe('Högsta pris i SEK om användaren anger budget.'),
              onlyGiveaways: z
                .boolean()
                .optional()
                .describe(
                  'Sätt true om användaren letar efter gratis material.',
                ),
            }),
            execute: async (toolInput) => {
              const products = await this.safeSearchPublicProducts(
                toolInput as SearchPublicProductsInput,
                owner.user?.id,
              );
              products.forEach((product) => {
                searchableProductsById.set(product.id, product);
              });
              return products;
            },
          }),
        },
      });

      for await (const textDelta of result.textStream) {
        assistantMessage += textDelta;
        this.writeEvent(response, 'delta', textDelta);
      }

      const finishReason = await result.finishReason;
      const messageStatus = this.getAssistantMessageStatus(finishReason);
      const finishNotice = this.getFinishNotice(finishReason);

      if (finishNotice) {
        const finishNoticeMarkdown = `\n\n_${finishNotice}_`;
        assistantMessage += finishNoticeMarkdown;
        this.writeEvent(response, 'delta', finishNoticeMarkdown);
      }

      const productDisplays = this.extractProductDisplays(
        assistantMessage,
        searchableProductsById,
      );
      if (productDisplays.length > 0) {
        this.writeEvent(response, 'productDisplays', productDisplays);
      }

      await this.messageRepository.save({
        chatId: chat.id,
        role: AterbyggarenMessageRole.ASSISTANT,
        status: messageStatus,
        content: assistantMessage,
        productDisplays: productDisplays.length ? productDisplays : null,
      });
      assistantSaved = true;
      await this.chatRepository.update(chat.id, { updatedAt: new Date() });

      await titleGeneration;

      if (!response.destroyed && !response.writableEnded) {
        this.writeEvent(response, 'done', { ok: true });
        response.end();
      }
    } catch (error) {
      const streamWasAborted = abortController.signal.aborted;

      if (!streamWasAborted) {
        this.logger.error(
          'Aterbyggaren failed to stream a response',
          error instanceof Error ? error.stack : String(error),
        );
      }

      if (savedUserMessage && !assistantSaved) {
        const fallbackContent = assistantMessage.trim()
          ? `${assistantMessage}\n\n_${streamWasAborted ? STREAM_INTERRUPTED_MESSAGE : STREAM_ERROR_MESSAGE}_`
          : streamWasAborted
            ? STREAM_INTERRUPTED_MESSAGE
            : STREAM_ERROR_MESSAGE;
        const fallbackProductDisplays = this.extractProductDisplays(
          fallbackContent,
          searchableProductsById,
        );

        await this.messageRepository.save({
          chatId: chat.id,
          role: AterbyggarenMessageRole.ASSISTANT,
          status: streamWasAborted
            ? AterbyggarenMessageStatus.INTERRUPTED
            : AterbyggarenMessageStatus.FAILED,
          content: fallbackContent,
          productDisplays: fallbackProductDisplays.length
            ? fallbackProductDisplays
            : null,
        });
        await this.chatRepository.update(chat.id, { updatedAt: new Date() });
      }

      if (!response.destroyed && !response.writableEnded) {
        this.writeEvent(response, 'error', {
          message: streamWasAborted
            ? STREAM_INTERRUPTED_MESSAGE
            : STREAM_ERROR_MESSAGE,
        });
        response.end();
      }
    } finally {
      await titleGeneration;
      request.off('close', abortStream);
    }
  }

  private async getOrCreateChat({
    chatId,
    titleSeed,
    owner,
  }: {
    chatId?: string;
    titleSeed: string;
    owner: ChatOwner;
  }) {
    if (chatId) {
      const existingChat = await this.getOwnedChat(chatId, owner);
      if (!existingChat) {
        throw new BadRequestException('Chatten kunde inte hittas');
      }
      return { chat: existingChat, created: false };
    }

    const chat = this.chatRepository.create({
      title: this.createTitle(titleSeed),
      userId: owner.user?.id,
      guestId: owner.user ? undefined : owner.guestId,
    });
    return { chat: await this.chatRepository.save(chat), created: true };
  }

  private async generateAndSaveChatTitle({
    chatId,
    placeholderTitle,
    userMessage,
    response,
  }: {
    chatId: string;
    placeholderTitle?: string;
    userMessage: string;
    response: Response;
  }) {
    try {
      const title = await this.generateChatTitle(userMessage);
      if (!title || title === placeholderTitle) return;

      await this.chatRepository.update(chatId, {
        title,
        updatedAt: new Date(),
      });
      this.writeEvent(response, 'title', { id: chatId, title });
    } catch (error) {
      this.logger.warn(
        'Aterbyggaren title generation failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private async generateChatTitle(userMessage: string) {
    const { output } = await this.withTimeout(
      (abortSignal) =>
        generateText({
          model: this.google('gemini-2.5-flash'),
          abortSignal,
          output: Output.object({
            schema: chatTitleSchema,
          }),
          temperature: 0.2,
          prompt: `
Skapa en kort svensk chattrubrik för Återbyggaren baserat på användarens första meddelande.

Regler:
- 2-6 ord.
- Max ${MAX_TITLE_LENGTH} tecken.
- Ingen punkt, inga citattecken och ingen markdown.
- Skriv bara en neutral rubrik som passar i en chattlista.

Första meddelandet:
${userMessage}
`,
        }),
      TITLE_GENERATION_TIMEOUT_MS,
    );

    return this.normalizeGeneratedTitle(output.title);
  }

  private async withTimeout<T>(
    task: (abortSignal: AbortSignal) => Promise<T>,
    timeoutMs: number,
  ) {
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), timeoutMs);

    try {
      return await task(abortController.signal);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async getOwnedChat(chatId: string, owner: ChatOwner) {
    const where = owner.user
      ? { id: chatId, userId: owner.user.id, deletedAt: IsNull() }
      : { id: chatId, guestId: owner.guestId, deletedAt: IsNull() };

    return this.chatRepository.findOne({ where });
  }

  private async getContextMessages(
    chatId: string,
    currentUserMessageId?: string,
  ): Promise<ModelMessage[]> {
    const messages = await this.messageRepository.find({
      where: { chatId },
      order: { createdAt: 'DESC' },
      take: MAX_CONTEXT_LOOKBACK_MESSAGES,
    });

    const orderedMessages = messages.reverse();
    const contextMessages = this.getCompleteContextMessages(
      orderedMessages,
      currentUserMessageId,
    );

    return contextMessages.slice(-MAX_CONTEXT_MESSAGES).map((message) => ({
      role:
        message.role === AterbyggarenMessageRole.USER ? 'user' : 'assistant',
      content: message.content,
    }));
  }

  private validateAttachmentRefs(
    input?: AterbyggarenStreamAttachmentRef[],
  ): AttachmentValidationResult {
    if (!input?.length) return { valid: true, items: [] };

    if (input.length > MAX_ATTACHMENT_COUNT) {
      return {
        valid: false,
        message: `Du kan bifoga max ${MAX_ATTACHMENT_COUNT} filer åt gången.`,
      };
    }

    const items: AterbyggarenStreamAttachmentRef[] = [];
    for (const attachment of input) {
      if (!attachment.id) {
        return { valid: false, message: 'En bifogad fil kunde inte läsas.' };
      }

      if (attachment.kind !== 'image' && attachment.kind !== 'document') {
        return { valid: false, message: 'Filtypen stöds inte.' };
      }

      items.push({
        id: attachment.id,
        kind: attachment.kind,
      });
    }

    return { valid: true, items };
  }

  private validateAttachmentInputs(
    input?: AterbyggarenAttachmentInput[],
  ):
    | { valid: true; items: AterbyggarenAttachmentInput[] }
    | { valid: false; message: string } {
    if (!input?.length) return { valid: true, items: [] };

    if (input.length > MAX_ATTACHMENT_COUNT) {
      return {
        valid: false,
        message: `Du kan bifoga max ${MAX_ATTACHMENT_COUNT} filer åt gången.`,
      };
    }

    const items: AterbyggarenAttachmentInput[] = [];
    for (const attachment of input) {
      if (!attachment.mimeType) {
        return { valid: false, message: 'En bifogad fil kunde inte läsas.' };
      }

      if (attachment.kind !== 'image' && attachment.kind !== 'document') {
        return { valid: false, message: 'Filtypen stöds inte.' };
      }

      if (
        attachment.kind === 'image' &&
        !attachment.mimeType.startsWith('image/')
      ) {
        return { valid: false, message: 'Bildfilen har ett ogiltigt format.' };
      }

      items.push({
        kind: attachment.kind,
        mimeType: attachment.mimeType,
        name: attachment.name,
      });
    }

    return { valid: true, items };
  }

  private async getStreamAttachments(
    refs: AterbyggarenStreamAttachmentRef[],
  ): Promise<AterbyggarenStreamAttachmentFile[]> {
    if (!refs.length) return [];

    const files = await this.fileRepository.find({
      where: { id: In(refs.map((attachment) => attachment.id)) },
    });
    const filesById = new Map(files.map((file) => [file.id, file]));

    return refs.map((attachment) => {
      const file = filesById.get(attachment.id);
      if (!file) {
        throw new BadRequestException('En bifogad fil kunde inte hittas.');
      }

      if (attachment.kind === 'image' && !file.mimeType.startsWith('image/')) {
        throw new BadRequestException('Bildfilen har ett ogiltigt format.');
      }

      return { file, kind: attachment.kind };
    });
  }

  private async attachFilesToMessage(
    message: AterbyggarenMessage,
    attachments: AterbyggarenStreamAttachmentFile[],
  ) {
    if (!attachments.length) return;

    await this.fileRepository.save(
      attachments.map(({ file, kind }) => ({
        ...file,
        aterbyggarenMessageDocument:
          kind === 'document' ? message : file.aterbyggarenMessageDocument,
        aterbyggarenMessageImage:
          kind === 'image' ? message : file.aterbyggarenMessageImage,
      })),
    );
  }

  private async getModelAttachmentParts(
    attachments: AterbyggarenStreamAttachmentFile[],
  ): Promise<(ImagePart | FilePart)[]> {
    return Promise.all(
      attachments.map(async ({ file, kind }) => {
        const url = new URL(await this.fileService.getUrl(file));

        if (kind === 'image') {
          return {
            type: 'image',
            image: url,
            mediaType: file.mimeType,
          } satisfies ImagePart;
        }

        return {
          type: 'file',
          data: url,
          filename: file.name,
          mediaType: file.mimeType,
        } satisfies FilePart;
      }),
    );
  }

  private async getMessageAttachments(
    message: AterbyggarenMessage,
  ): Promise<AterbyggarenMessageAttachmentResponse[]> {
    const files = await this.fileRepository.find({
      where: [
        { aterbyggarenMessageImage: { id: message.id } },
        { aterbyggarenMessageDocument: { id: message.id } },
      ],
      relations: {
        aterbyggarenMessageDocument: true,
        aterbyggarenMessageImage: true,
      },
      order: { createdAt: 'ASC' },
    });

    return Promise.all(
      files.map(async (file) => ({
        id: file.id,
        kind: file.aterbyggarenMessageImage ? 'image' : 'document',
        mimeType: file.mimeType,
        name: file.name,
        url: await this.fileService.getUrl(file),
      })),
    );
  }

  private withCurrentAttachments(
    messages: ModelMessage[],
    attachments: (ImagePart | FilePart)[],
  ): ModelMessage[] {
    if (!attachments.length) return messages;

    const lastUserMessageIndex = this.getLastUserMessageIndex(messages);
    if (lastUserMessageIndex < 0) return messages;

    return messages.map((message, index) => {
      if (index !== lastUserMessageIndex || message.role !== 'user') {
        return message;
      }

      return {
        ...message,
        content: [
          { type: 'text', text: String(message.content) },
          ...attachments,
        ],
      };
    });
  }

  private getLastUserMessageIndex(messages: ModelMessage[]) {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === 'user') return index;
    }
    return -1;
  }

  private getCompleteContextMessages(
    messages: AterbyggarenMessage[],
    currentUserMessageId?: string,
  ) {
    const currentUserMessageIndex = currentUserMessageId
      ? messages.findIndex((message) => message.id === currentUserMessageId)
      : -1;
    const currentUserMessage =
      currentUserMessageIndex >= 0 ? messages[currentUserMessageIndex] : null;
    const previousMessages =
      currentUserMessageIndex >= 0
        ? messages.slice(0, currentUserMessageIndex)
        : messages;
    const completeMessages: AterbyggarenMessage[] = [];

    for (let index = 0; index < previousMessages.length; index += 1) {
      const message = previousMessages[index];
      const nextMessage = previousMessages[index + 1];

      if (message.role === AterbyggarenMessageRole.USER) {
        if (
          nextMessage?.role === AterbyggarenMessageRole.ASSISTANT &&
          nextMessage.status === AterbyggarenMessageStatus.COMPLETE
        ) {
          completeMessages.push(message, nextMessage);
          index += 1;
        }
        continue;
      }

      if (
        message.role === AterbyggarenMessageRole.ASSISTANT &&
        message.status === AterbyggarenMessageStatus.COMPLETE
      ) {
        completeMessages.push(message);
      }
    }

    if (currentUserMessage) {
      completeMessages.push(currentUserMessage);
    }

    return completeMessages;
  }

  private getAssistantMessageStatus(finishReason: FinishReason) {
    return finishReason === 'length'
      ? AterbyggarenMessageStatus.INTERRUPTED
      : AterbyggarenMessageStatus.COMPLETE;
  }

  private getFinishNotice(finishReason: FinishReason) {
    return finishReason === 'length' ? STREAM_LENGTH_LIMIT_MESSAGE : undefined;
  }

  private async safeSearchPublicProducts(
    input: SearchPublicProductsInput,
    userId?: string,
  ) {
    try {
      return await this.searchPublicProducts(input, userId);
    } catch (error) {
      this.logger.warn(
        `Aterbyggaren product search failed for query "${input.query}"`,
        error instanceof Error ? error.stack : String(error),
      );
      return [];
    }
  }

  private async searchPublicProducts(
    input: SearchPublicProductsInput,
    userId?: string,
  ): Promise<PublicProductSearchResult[]> {
    const searchString = input.query.trim();
    if (!searchString) return [];

    const limit = Math.min(input.limit ?? 5, 8);
    const productsInput: ProductsInput = {
      searchString,
      orderBy: OrderProductsEnum.BEST_MATCH,
      onlyPublished: true,
      maxPrice: input.maxPrice,
      giveaway: input.onlyGiveaways ? true : undefined,
    };
    const exactProductsResult = await this.productService.findAll(
      productsInput,
      limit,
      0,
      undefined,
    );
    const exactProducts = exactProductsResult.products;
    let products = exactProducts;

    if (exactProducts.length < limit) {
      const relatedProductsResult = await this.productService.relatedProducts(
        productsInput,
        exactProducts.map((product) => product.id),
        limit - exactProducts.length,
        0,
        undefined,
      );
      products = [...exactProducts, ...relatedProductsResult.products];
    }

    const productsWithRelations =
      await this.loadPublicProductRelations(products);
    const likedProductIds = await this.getLikedProductIds(
      productsWithRelations.map((product) => product.id),
      userId,
    );

    return Promise.all(
      productsWithRelations.map(async (product) => {
        const primaryImage = product.images?.[0];
        const imageUrl = primaryImage
          ? await this.getPublicProductImageUrl(primaryImage)
          : undefined;

        return {
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price / 100,
          isGiveaway: product.isGiveaway,
          condition: product.condition,
          category: product.category?.name,
          brand: product.brand?.name,
          pickupEnabled: product.pickupEnabled,
          deliveryEnabled: product.deliveryEnabled,
          likedByMe: likedProductIds?.has(product.id) ?? null,
          url: `/product/${product.id}`,
          imageUrl,
        };
      }),
    );
  }

  private async loadPublicProductRelations(products: Product[]) {
    const productIds = products.map((product) => product.id);
    if (!productIds.length) return [];

    const productsWithRelations = await this.productRepository.find({
      where: {
        id: In(productIds),
        status: ProductStatus.PUBLISHED,
        hiddenReason: IsNull(),
        deletedAt: IsNull(),
      },
      relations: { images: true, category: true, brand: true },
    });
    const productsById = new Map(
      productsWithRelations.map((product) => [product.id, product]),
    );

    return products
      .map((product) => productsById.get(product.id))
      .filter((product): product is Product => !!product);
  }

  private async getLikedProductIds(productIds: string[], userId?: string) {
    if (!userId || !productIds.length) return undefined;

    const likedProducts = await this.productRepository.find({
      where: { id: In(productIds), likedBy: { id: userId } },
      select: { id: true },
    });

    return new Set(likedProducts.map((product) => product.id));
  }

  private async hydrateProductDisplayLikes(
    productDisplays?: AterbyggarenProductDisplay[] | null,
    userId?: string,
  ) {
    if (!productDisplays?.length || !userId) return productDisplays;

    const productIds = productDisplays.flatMap((display) =>
      display.products.map((product) => product.id),
    );
    const likedProductIds = await this.getLikedProductIds(productIds, userId);

    return productDisplays.map((display) => ({
      ...display,
      products: display.products.map((product) => ({
        ...product,
        likedByMe: likedProductIds?.has(product.id) ?? null,
      })),
    }));
  }

  private async getPublicProductImageUrl(
    primaryImage: Product['images'][number],
  ) {
    try {
      return await this.fileService.getUrl(primaryImage);
    } catch (error) {
      this.logger.warn(
        `Could not resolve product image URL for Aterbyggaren search result ${primaryImage.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      return undefined;
    }
  }

  private async toMessageResponse(
    message: AterbyggarenMessage,
    userId?: string,
  ): Promise<AterbyggarenMessageResponse> {
    return {
      attachments: await this.getMessageAttachments(message),
      id: message.id,
      role:
        message.role === AterbyggarenMessageRole.USER ? 'user' : 'assistant',
      content: message.content,
      createdAt: message.createdAt,
      productDisplays: await this.hydrateProductDisplayLikes(
        message.productDisplays,
        userId,
      ),
    };
  }

  private extractProductDisplays(
    content: string,
    searchableProductsById: Map<string, PublicProductSearchResult>,
  ): AterbyggarenProductDisplay[] {
    const displays: AterbyggarenProductDisplay[] = [];
    const tagRegex = /<rebuildr-products\s+ids=(['"])(.*?)\1\s*\/?\s*>/g;

    for (const match of content.matchAll(tagRegex)) {
      const ids = match[2]
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      const uniqueIds = [...new Set(ids)];
      const products = uniqueIds
        .map((id) => searchableProductsById.get(id))
        .filter((product): product is PublicProductSearchResult => !!product)
        .slice(0, 8);

      if (products.length > 0) {
        displays.push({ type: 'products', products });
      }
    }

    return displays;
  }

  private writeEvent(response: Response, event: string, data: unknown) {
    if (response.destroyed || response.writableEnded) return;

    try {
      response.write(`event: ${event}\n`);
      response.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {
      return;
    }
  }

  private createTitle(message: string) {
    const title = message.replace(/\s+/g, ' ').trim();
    return title.length > MAX_TITLE_LENGTH
      ? `${title.slice(0, MAX_TITLE_LENGTH - 3)}...`
      : title;
  }

  private normalizeGeneratedTitle(title: string) {
    const normalizedTitle = title
      .replace(/["'“”‘’]/g, '')
      .replace(/[.!?。]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!normalizedTitle) return undefined;
    return normalizedTitle.length > MAX_TITLE_LENGTH
      ? normalizedTitle.slice(0, MAX_TITLE_LENGTH).trim()
      : normalizedTitle;
  }
}
