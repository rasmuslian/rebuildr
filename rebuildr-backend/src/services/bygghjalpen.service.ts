import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModelMessage, stepCountIs, streamText, tool } from 'ai';
import { Response } from 'express';
import { z } from 'zod';

import { AuthedUserType } from 'src/auth/constants';
import { BygghjalpenChat } from 'src/entities/bygghjalpen-chat.entity';
import {
  BygghjalpenProductDisplay,
  BygghjalpenMessage,
  BygghjalpenMessageRole,
} from 'src/entities/bygghjalpen-message.entity';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { FileService } from 'src/services/file.service';
import { Brackets, IsNull, Repository } from 'typeorm';

const MAX_MESSAGE_LENGTH = 4_000;
const MAX_CONTEXT_MESSAGES = 16;
const PRODUCT_SEARCH_RANK_THRESHOLD = 0.25;

export interface BygghjalpenChatSummary {
  id: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BygghjalpenMessageResponse {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  productDisplays?: BygghjalpenProductDisplay[] | null;
}

interface ChatOwner {
  user?: AuthedUserType;
  guestId?: string;
}

interface SendMessageInput {
  chatId?: string;
  message: string;
  guestId?: string;
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
  url: string;
  imageUrl?: string;
}

@Injectable()
export class BygghjalpenService {
  private readonly logger = new Logger(BygghjalpenService.name);

  private google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  private readonly systemPrompt = `
Du är Bygghjälpen, RebuildRs svenska AI-assistent för bygg, renovering, återbruk och hemmafix.

Svara alltid på svenska. Var praktisk, lugn, tydlig och konkret. Hjälp användaren att bryta ner projekt i steg, material, verktyg, risker och nästa rimliga beslut.

Viktiga gränser:
- Uppmana användaren att anlita eller rådfråga behörig fackperson vid el, VVS, bärande konstruktioner, taksäkerhet, brandskydd, asbest, mögel, farliga material, tillstånd och arbeten där fel kan orsaka personskada eller stora skador.
- Gissa inte om lagkrav eller dimensionering. Säg när något behöver kontrolleras lokalt eller av sakkunnig.
- Du får aldrig skriva, ändra, reservera, köpa, sälja, kontakta säljare eller på annat sätt mutera data i RebuildR.
- Du får bara använda verktyg för att läsa publikt synliga produktannonser.

När användaren letar material eller frågar om RebuildR har en viss produkt, måste du anropa searchPublicProducts innan du svarar om tillgänglighet. Sammanfatta kort varför träffarna passar. Säg om sökningen inte hittade något bra och föreslå bättre sökord.

När searchPublicProducts returnerar produkter och du vill visa en eller flera av dem som riktiga produktkort, skriv en egen rad med exakt format <rebuildr-products ids="id1,id2,id3" />. Använd bara id:n som verktyget nyss returnerade. Välj bara de mest relevanta produkterna, och visa gärna en enda produkt om bara en träff är riktigt bra. Skriv inte produktkortet själv i text.

Formatera gärna med Markdown, korta rubriker, punktlistor och tabeller när det gör svaret mer lättläst.`;

  constructor(
    @InjectRepository(BygghjalpenChat)
    private chatRepository: Repository<BygghjalpenChat>,
    @InjectRepository(BygghjalpenMessage)
    private messageRepository: Repository<BygghjalpenMessage>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private fileService: FileService,
  ) {}

  async listChats(user?: AuthedUserType): Promise<BygghjalpenChatSummary[]> {
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
  ): Promise<BygghjalpenMessageResponse[]> {
    if (!user) return [];

    const chat = await this.getOwnedChat(chatId, { user });
    if (!chat) return [];

    const messages = await this.messageRepository.find({
      where: { chatId: chat.id },
      order: { createdAt: 'ASC' },
    });

    return messages.map((message) => this.toMessageResponse(message));
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

  async streamMessage(
    input: SendMessageInput,
    owner: ChatOwner,
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

    const chat = await this.getOrCreateChat({
      chatId: input.chatId,
      titleSeed: userMessage,
      owner,
    });

    response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    response.setHeader('Cache-Control', 'no-cache, no-transform');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders?.();

    this.writeEvent(response, 'chat', {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    });

    await this.messageRepository.save({
      chatId: chat.id,
      role: BygghjalpenMessageRole.USER,
      content: userMessage,
    });

    let assistantMessage = '';
    const searchableProductsById = new Map<string, PublicProductSearchResult>();

    try {
      const contextMessages = await this.getContextMessages(chat.id);

      const result = streamText({
        model: this.google('gemini-2.5-flash'),
        system: this.systemPrompt,
        messages: contextMessages,
        maxOutputTokens: 1_600,
        temperature: 0.35,
        stopWhen: stepCountIs(4),
        tools: {
          searchPublicProducts: tool({
            description:
              'Sök efter publika RebuildR-annonser. Verktyget är strikt read-only och returnerar bara publikt synliga produktfält.',
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

      const productDisplays = this.extractProductDisplays(
        assistantMessage,
        searchableProductsById,
      );
      if (productDisplays.length > 0) {
        this.writeEvent(response, 'productDisplays', productDisplays);
      }

      await this.messageRepository.save({
        chatId: chat.id,
        role: BygghjalpenMessageRole.ASSISTANT,
        content: assistantMessage,
        productDisplays: productDisplays.length ? productDisplays : null,
      });
      await this.chatRepository.update(chat.id, { updatedAt: new Date() });

      this.writeEvent(response, 'done', { ok: true });
      response.end();
    } catch (error) {
      this.logger.error(
        'Bygghjalpen failed to stream a response',
        error instanceof Error ? error.stack : String(error),
      );
      this.writeEvent(response, 'error', {
        message:
          'Bygghjälpen kunde inte svara just nu. Försök igen om en stund.',
      });
      response.end();
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
      return existingChat;
    }

    const chat = this.chatRepository.create({
      title: this.createTitle(titleSeed),
      userId: owner.user?.id,
      guestId: owner.user ? undefined : owner.guestId,
    });
    return this.chatRepository.save(chat);
  }

  private async getOwnedChat(chatId: string, owner: ChatOwner) {
    const where = owner.user
      ? { id: chatId, userId: owner.user.id, deletedAt: IsNull() }
      : { id: chatId, guestId: owner.guestId, deletedAt: IsNull() };

    return this.chatRepository.findOne({ where });
  }

  private async getContextMessages(chatId: string): Promise<ModelMessage[]> {
    const messages = await this.messageRepository.find({
      where: { chatId },
      order: { createdAt: 'DESC' },
      take: MAX_CONTEXT_MESSAGES,
    });

    return messages.reverse().map((message) => ({
      role: message.role === BygghjalpenMessageRole.USER ? 'user' : 'assistant',
      content: message.content,
    }));
  }

  private async safeSearchPublicProducts(input: SearchPublicProductsInput) {
    try {
      return await this.searchPublicProducts(input);
    } catch (error) {
      this.logger.warn(
        `Bygghjalpen product search failed for query "${input.query}"`,
        error instanceof Error ? error.stack : String(error),
      );
      return [];
    }
  }

  private async searchPublicProducts(
    input: SearchPublicProductsInput,
  ): Promise<PublicProductSearchResult[]> {
    const limit = Math.min(input.limit ?? 5, 8);
    const searchTerms = this.createSearchTerms(input.query);
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'image')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.status = :status', { status: ProductStatus.PUBLISHED })
      .andWhere('product."hiddenReason" IS NULL')
      .andWhere('product."deletedAt" IS NULL')
      .andWhere(
        new Brackets((qb) => {
          qb.where(
            'product."textSearch" @@ plainto_tsquery(\'swedish\', :searchQuery)',
          ).orWhere(
            'similarity(product.title, :searchQuery) > :searchRankThreshold',
          );

          searchTerms.forEach((searchTerm, index) => {
            qb.orWhere(
              `(product.title ILIKE :searchTerm${index} OR product.description ILIKE :searchTerm${index})`,
              { [`searchTerm${index}`]: `%${searchTerm}%` },
            );
          });
        }),
      )
      .setParameters({
        searchQuery: input.query,
        searchRankThreshold: PRODUCT_SEARCH_RANK_THRESHOLD,
      })
      .orderBy('product."publishedAt"', 'DESC', 'NULLS LAST')
      .limit(limit);

    if (input.maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', {
        maxPrice: Math.round(input.maxPrice * 100),
      });
    }
    if (input.onlyGiveaways) {
      query.andWhere('product."isGiveaway" = TRUE');
    }

    const products = await query.getMany();

    return Promise.all(
      products.map(async (product) => {
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
          url: `/product/${product.id}`,
          imageUrl,
        };
      }),
    );
  }

  private createSearchTerms(query: string) {
    const stopWords = new Set([
      'att',
      'den',
      'det',
      'din',
      'dit',
      'efter',
      'eller',
      'era',
      'ett',
      'finns',
      'för',
      'har',
      'hos',
      'hur',
      'jag',
      'kan',
      'med',
      'mig',
      'ni',
      'någon',
      'något',
      'några',
      'och',
      'produkt',
      'produkter',
      'på',
      'rebuildr',
      'som',
      'till',
      'vad',
      'vill',
      'vår',
      'våra',
    ]);
    const terms = query
      .toLocaleLowerCase('sv-SE')
      .split(/\s+/)
      .map((term) => term.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
      .filter((term) => term.length >= 3 && !stopWords.has(term));

    return [
      ...new Set(terms.flatMap((term) => [term, ...this.stemSearchTerm(term)])),
    ];
  }

  private stemSearchTerm(term: string) {
    if (term.length < 5) return [];

    if (/(arna|erna|orna)$/.test(term)) return [term.slice(0, -4)];
    if (/(ar|er|or)$/.test(term)) return [term.slice(0, -2)];
    if (/(en|et)$/.test(term)) return [term.slice(0, -2)];
    if (/r$/.test(term)) return [term.slice(0, -1)];

    return [];
  }

  private async getPublicProductImageUrl(
    primaryImage: Product['images'][number],
  ) {
    try {
      return await this.fileService.getUrl(primaryImage);
    } catch (error) {
      this.logger.warn(
        `Could not resolve product image URL for Bygghjalpen search result ${primaryImage.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      return undefined;
    }
  }

  private toMessageResponse(
    message: BygghjalpenMessage,
  ): BygghjalpenMessageResponse {
    return {
      id: message.id,
      role: message.role === BygghjalpenMessageRole.USER ? 'user' : 'assistant',
      content: message.content,
      createdAt: message.createdAt,
      productDisplays: message.productDisplays,
    };
  }

  private extractProductDisplays(
    content: string,
    searchableProductsById: Map<string, PublicProductSearchResult>,
  ): BygghjalpenProductDisplay[] {
    const displays: BygghjalpenProductDisplay[] = [];
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
    response.write(`event: ${event}\n`);
    response.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  private createTitle(message: string) {
    const title = message.replace(/\s+/g, ' ').trim();
    return title.length > 46 ? `${title.slice(0, 43)}...` : title;
  }
}
