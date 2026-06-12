import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ModelMessage, stepCountIs, streamText, tool } from 'ai';
import { Response } from 'express';
import { z } from 'zod';

import { AuthedUserType } from 'src/auth/constants';
import { BygghjalpenChat } from 'src/entities/bygghjalpen-chat.entity';
import {
  BygghjalpenMessage,
  BygghjalpenMessageRole,
} from 'src/entities/bygghjalpen-message.entity';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { FileService } from 'src/services/file.service';
import { IsNull, Repository } from 'typeorm';

const MAX_MESSAGE_LENGTH = 4_000;
const MAX_CONTEXT_MESSAGES = 16;

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

@Injectable()
export class BygghjalpenService {
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

När användaren letar material, använd searchPublicProducts om det kan hjälpa. Presentera träffar kort med titel, pris, skick och länk. Säg om sökningen inte hittade något bra och föreslå bättre sökord.

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

    const contextMessages = await this.getContextMessages(chat.id);
    let assistantMessage = '';

    try {
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
            execute: async (toolInput) =>
              this.searchPublicProducts(toolInput as SearchPublicProductsInput),
          }),
        },
      });

      for await (const textDelta of result.textStream) {
        assistantMessage += textDelta;
        this.writeEvent(response, 'delta', textDelta);
      }

      await this.messageRepository.save({
        chatId: chat.id,
        role: BygghjalpenMessageRole.ASSISTANT,
        content: assistantMessage,
      });
      await this.chatRepository.update(chat.id, { updatedAt: new Date() });

      this.writeEvent(response, 'done', { ok: true });
      response.end();
    } catch {
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

  private async searchPublicProducts(input: SearchPublicProductsInput) {
    const limit = Math.min(input.limit ?? 5, 8);
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'image')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .where('product.status = :status', { status: ProductStatus.PUBLISHED })
      .andWhere('product."hiddenReason" IS NULL')
      .andWhere('product."deletedAt" IS NULL')
      .andWhere(
        '(product.title ILIKE :search OR product.description ILIKE :search)',
        { search: `%${input.query}%` },
      )
      .orderBy('product."publishedAt"', 'DESC')
      .take(limit);

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
          imageUrl: primaryImage
            ? await this.fileService.getUrl(primaryImage)
            : undefined,
        };
      }),
    );
  }

  private toMessageResponse(
    message: BygghjalpenMessage,
  ): BygghjalpenMessageResponse {
    return {
      id: message.id,
      role: message.role === BygghjalpenMessageRole.USER ? 'user' : 'assistant',
      content: message.content,
      createdAt: message.createdAt,
    };
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
