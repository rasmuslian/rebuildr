import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { DataloaderService } from './dataloader.service';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { Conversation } from 'src/entities/conversation.entity';
import { User } from 'src/entities/user.entity';
import { Message } from 'src/entities/message.entity';
import { DataSource, In, IsNull } from 'typeorm';

export interface IConversationLoaders {
  buyerLoader: DataLoader<string, User>;
  productLoader: DataLoader<string, Product>;
  purchaseLoader: DataLoader<string, Purchase | null>;
  messagesLoader: DataLoader<
    { conversationId: string; receiverId: string },
    Message[]
  >;
  lastMessageLoader: DataLoader<
    { conversationId: string; receiverId: string },
    Message | null
  >;
}
@Injectable()
export class ConversationLoader {
  constructor(
    private readonly dataloaderService: DataloaderService,
    private readonly dataSource: DataSource,
  ) {}

  private messagesLoader() {
    return new DataLoader(
      async (
        keys: readonly { conversationId: string; receiverId: string }[],
      ) => {
        const conversationIds = keys.map((k) => k.conversationId);
        const userIds = keys.map((k) => k.receiverId);
        const messages = await this.dataSource.getRepository(Message).find({
          where: [
            {
              conversationId: In(conversationIds),
              receiverId: IsNull(),
            },
            {
              conversationId: In(conversationIds),
              receiverId: In(userIds),
            },
          ],
          order: { createdAt: 'ASC' },
        });

        return keys.map((k) =>
          messages.filter(
            (m) =>
              m.conversationId === k.conversationId &&
              (!m.receiverId || m.receiverId === k.receiverId),
          ),
        );
      },
    );
  }

  private lastMessageLoader() {
    return new DataLoader<
      { conversationId: string; receiverId: string },
      Message | null
    >(
      async (
        keys: readonly { conversationId: string; receiverId: string }[],
      ) => {
        const conversationIds = keys.map((k) => k.conversationId);
        const userIds = keys.map((k) => k.receiverId);
        const messages = await this.dataSource.query<Message[]>(
          `
            SELECT DISTINCT ON ("conversationId") *
            FROM message
            WHERE "conversationId" = ANY($1) AND ("receiverId" IS NULL OR "receiverId" = ANY($2))
            ORDER BY "conversationId", "createdAt" DESC
          `,
          [conversationIds, userIds],
        );

        return conversationIds.map(
          (id) => messages.find((m) => m.conversationId === id) ?? null,
        );
      },
    );
  }

  createLoaders(): IConversationLoaders {
    return {
      buyerLoader: this.dataloaderService.targetByParentIdLoader<User>(
        'buyer',
        Conversation,
      ),
      productLoader: this.dataloaderService.targetByParentIdLoader<Product>(
        'product',
        Conversation,
      ),
      purchaseLoader:
        this.dataloaderService.targetByParentIdLoader<Purchase | null>(
          'purchase',
          Conversation,
        ),
      messagesLoader: this.messagesLoader(),
      lastMessageLoader: this.lastMessageLoader(),
    };
  }
}
