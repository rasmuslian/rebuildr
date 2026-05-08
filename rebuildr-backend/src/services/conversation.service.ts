import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Conversation } from 'src/entities/conversation.entity';
import { BadUserInputException, NotFoundException } from 'src/exceptions';
import { DataSource, In, Repository } from 'typeorm';
import { Logger } from 'winston';
import { MessageService } from './message.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from './mail.service';
import { User, UserType } from 'src/entities/user.entity';
import {
  GetConversationsInput,
  GetConversationsType,
  MarkAsReadInput,
} from 'src/resolvers/conversation.resolver';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private messageService: MessageService,
    private mailService: MailService,
    private dataSource: DataSource,
  ) {}

  async getConversation(id: string, currentUserId: string) {
    const c = await this.conversationRepository.findOne({
      where: [
        {
          id,
          buyerId: currentUserId,
        },
        {
          id,
          product: { sellerId: currentUserId },
        },
      ],
      order: { createdAt: 'DESC' },
    });

    if (!c) {
      throw NotFoundException;
    }

    return c;
  }

  async getConversations(input: GetConversationsInput, currentUserId: string) {
    const conversationAlias = 'conversation';
    const query =
      this.conversationRepository.createQueryBuilder(conversationAlias);

    if (input.productId) {
      query.where(`${conversationAlias}."productId" = :productId`, {
        productId: input.productId,
      });
    }
    if (input.type === GetConversationsType.SELLING) {
      query.innerJoin(
        `${conversationAlias}.product`,
        'p',
        `${conversationAlias}."productId" = p.id`,
      );
      query.andWhere('p."sellerId" = :userId', { userId: currentUserId });
    }
    if (input.type === GetConversationsType.BUYING) {
      query.andWhere(`${conversationAlias}."buyerId" = :userId`, {
        userId: currentUserId,
      });
    }
    if (input.type === GetConversationsType.BUYING_AND_SELLING) {
      query.innerJoin(
        `${conversationAlias}.product`,
        'p',
        `${conversationAlias}."productId" = p.id`,
      );
      query.andWhere(
        `(${conversationAlias}."buyerId" = :userId OR p."sellerId" = :userId)`,
        { userId: currentUserId },
      );
    }
    query.orderBy(`${conversationAlias}."createdAt"`, 'DESC');
    return query.getMany();
  }

  async markAsRead(input: MarkAsReadInput, currentUserId: string) {
    const conversation = await this.conversationRepository.findOne({
      where: [
        {
          id: input.conversationId,
          buyerId: currentUserId,
        },
        {
          id: input.conversationId,
          product: { sellerId: currentUserId },
        },
      ],
    });
    if (!conversation) {
      this.logger.error({
        message: 'Conversation matching input not found',
        input,
        currentUserId,
      });
      throw BadUserInputException('Invalid conversation');
    }

    if (conversation.buyerId === currentUserId) {
      conversation.buyerReadAt = new Date();
    } else {
      conversation.sellerReadAt = new Date();
    }

    return this.conversationRepository.save(conversation);
  }

  async getUnreadConversationsCount(currentUserId: string) {
    const result = await this.dataSource.query(
      `
      SELECT COUNT(*) FROM (
      SELECT
	c.id,
	CASE
		WHEN p."sellerId" = '${currentUserId}' THEN c."sellerReadAt" IS NULL
		OR MAX(m."createdAt") > c."sellerReadAt"
		ELSE c."buyerReadAt" IS NULL
		OR MAX(m."createdAt") > c."buyerReadAt"
	END "unread"
FROM
	message m
	INNER JOIN conversation c ON m."conversationId" = c.id
	INNER JOIN product p ON c."productId" = p.id
WHERE
	
		c."buyerId" = '${currentUserId}'
		OR p."sellerId" = '${currentUserId}'
GROUP BY
	c.id,
	p.id) WHERE "unread" = TRUE`,
    );
    return parseInt(result[0].count, 10);
  }

  async getConversationByPurchaseId(purchaseId: string) {
    return this.conversationRepository.findOne({ where: { purchaseId } });
  }

  async deleteMany(conversations: Conversation[]) {
    return await Promise.all(conversations.map((c) => this.delete(c.id)));
  }
  async delete(id: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: { messages: true },
    });
    if (!conversation) {
      return null;
    }
    await this.messageService.deleteMany(conversation.messages);
    await this.conversationRepository.remove(conversation);
  }

  @Cron(
    process.env.NODE_ENV === 'production'
      ? CronExpression.EVERY_HOUR
      : CronExpression.EVERY_MINUTE,
  )
  async notifyUserMissedMessages() {
    const logger = this.logger.child({
      cron: 'notifyOnUserMessages',
      requestId: crypto.randomUUID(),
    });
    logger.info('Notifying users on missed messages');

    const receivers = await this.dataSource.query<
      {
        receiverId: string;
        receiverEmail: string;
        userType: UserType;
        productTitle: string;
      }[]
    >(`
      SELECT buyer.id AS "receiverId", buyer.email AS "receiverEmail", buyer.type AS "userType", p.title AS "productTitle"
      FROM conversation c
      JOIN product p ON p.id = c."productId"
      JOIN "user" buyer ON buyer.id = c."buyerId"
      WHERE buyer."notifyOnMessage" = TRUE
        AND EXISTS (
          SELECT 1 FROM message m
          WHERE m."conversationId" = c.id
            AND m."messageType" = 'USER'::message_messagetype_enum
            AND m."senderId" != c."buyerId"
            AND (c."buyerReadAt" IS NULL OR m."createdAt" > c."buyerReadAt")
            AND (buyer."notifiedOnMessageAt" IS NULL OR m."createdAt" > buyer."notifiedOnMessageAt")
        )

      UNION

      SELECT seller.id AS "receiverId", seller.email AS "receiverEmail", seller.type AS "userType", p.title AS "productTitle"
      FROM conversation c
      JOIN product p ON p.id = c."productId"
      JOIN "user" seller ON seller.id = p."sellerId"
      WHERE seller."notifyOnMessage" = TRUE
        AND EXISTS (
          SELECT 1 FROM message m
          WHERE m."conversationId" = c.id
            AND m."messageType" = 'USER'::message_messagetype_enum
            AND m."senderId" = c."buyerId"
            AND (c."sellerReadAt" IS NULL OR m."createdAt" > c."sellerReadAt")
            AND (seller."notifiedOnMessageAt" IS NULL OR m."createdAt" > seller."notifiedOnMessageAt")
        )
    `);

    await Promise.all(
      receivers.map(async (receiver) => {
        let receiverEmail = receiver.receiverEmail;
        logger.info('Notifying user of missed message', {
          productTitle: receiver.productTitle,
          userId: receiver.receiverId,
        });
        if (receiver.userType === UserType.BUSINESS) {
          const owner = await this.userRepository.findOne({
            where: { organizations: { id: receiver.receiverId } },
          });
          if (!owner) {
            logger.error({ message: 'Owner not found', receiver });
            return;
          }
          receiverEmail = owner.email;
        }
        await this.mailService.sendUserMessageEmail({
          productTitle: receiver.productTitle,
          receiverEmail,
        });
      }),
    );

    if (receivers.length > 0) {
      await this.userRepository.update(
        { id: In(receivers.map((r) => r.receiverId)) },
        { notifiedOnMessageAt: new Date() },
      );
    }
  }
}
