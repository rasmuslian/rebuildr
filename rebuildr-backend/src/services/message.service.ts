import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message, MessageTypeEnum } from 'src/entities/message.entity';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { User, UserType } from 'src/entities/user.entity';
import { BadUserInputException, InternalServerException } from 'src/exceptions';
import {
  GetConversationInput,
  GetConversationsInput,
  GetConversationsType,
  MarkAsReadInput,
} from 'src/resolvers/message.resolver';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { PurchaseService } from './purchase.service';
import { MailService } from './mail.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserService } from './user.service';
import { FileInputType } from 'src/resolvers/file.resolver';
import { FileService } from './file.service';

export interface SystemMessageInput {
  productId: string;
  purchaseId: string;
  senderId: string;
  receiverId: string;
  message: string;
}
@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    private purchaseService: PurchaseService,
    private mailService: MailService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private fileService: FileService,
  ) {}

  async getConversation(input: GetConversationInput, currentUserId) {
    const { productId, purchaseId, otherUserId } = input;
    const result = await this.messageRepository.find({
      where: [
        {
          product: { id: productId },
          purchase: { id: purchaseId },
          receiver: { id: currentUserId },
          sender: { id: otherUserId },
        },
        {
          product: { id: productId },
          purchase: { id: purchaseId },
          sender: { id: currentUserId },
          receiver: { id: otherUserId },
          messageType: MessageTypeEnum.USER,
        },
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    return result;
  }

  /**
   * Get all conversations for a user
   *
   * A conversation is defined by its last message,
   * so we only return the last message of each conversation here.
   *
   * readAt is from the receiver's perspective, so it is from the last message sent to the receiver.
   *
   * selling: boolean - true if the user is the seller, false if the user is the buyer
   */
  async getConversations(
    input: GetConversationsInput,
    currentUserId: string,
  ): Promise<Message[]> {
    const conversations = await this.dataSource
      .createQueryBuilder()
      .select(
        'm.message_id as id, m.message_message as message, m."message_createdAt" as "createdAt", m."message_senderId" as "senderId", m."message_receiverId" as "receiverId", m."message_productId" as "productId", m."message_purchaseId" as "purchaseId", m."message_readAt" as "readAt", m."message_messageType" as "messageType"',
      )
      .from((qb) => {
        qb.select('message')
          .addSelect(
            `row_number() over(
              partition by message."productId",
              message."purchaseId",
              LEAST(message."senderId", message."receiverId"),
          		GREATEST(message."senderId", message."receiverId")
              order by message."createdAt" desc
              )`,
            'rank',
          )
          .from(Message, 'message');

        if (input.type === GetConversationsType.SELLING) {
          qb.innerJoin(
            'message.product',
            'product',
            'product.sellerId = :userId',
            {
              userId: currentUserId,
            },
          );
        }

        if (input.type === GetConversationsType.BUYING) {
          qb.innerJoin(
            'message.product',
            'product',
            'product.sellerId != :userId',
            {
              userId: currentUserId,
            },
          );
        }

        qb.where(
          `(message."receiverId" = :userId OR (message."senderId" = :userId AND message."messageType" = '${MessageTypeEnum.USER}'::message_messagetype_enum))`,
          {
            userId: currentUserId,
          },
        );

        if (input.productId) {
          qb.andWhere(`message."productId" = '${input.productId}'`);
        }

        return qb;
      }, 'm')
      .where('m.rank = 1')
      .orderBy('m."message_createdAt"', 'DESC')
      .getRawMany();

    return conversations;
  }

  async create(input: {
    senderId: string;
    receiverId: string;
    productId: string;
    purchaseId?: string;
    message: string;
    images?: FileInputType[];
    documents?: FileInputType[];
  }) {
    if (input.receiverId === input.senderId) {
      throw BadUserInputException('Cannot send message on own product');
    }
    const message = new Message();
    try {
      message.message = input.message;
      message.receiverId = input.receiverId;
      message.senderId = input.senderId;
      message.productId = input.productId;
      message.purchaseId = input.purchaseId;

      if (input.purchaseId) {
        await this.purchaseService.handleSellerResponse(input.purchaseId);
      }

      const images = input.images;
      if (images) {
        const files = await this.fileService.createFiles(images, true);
        message.images = files;
        message.imagePutUrls = await this.fileService.uploadFiles(files);
      }
      const documents = input.documents;
      if (documents) {
        const files = await this.fileService.createFiles(documents, true);
        message.documents = files;
        message.documentPutUrls = await this.fileService.uploadFiles(files);
      }

      return await this.messageRepository.save(message);
    } catch (e) {
      this.logger.error('Invalid conversation', {
        ...input,
        e,
      });
      throw BadUserInputException('Invalid conversation');
    }
  }

  async sendSystemMessage(input: SystemMessageInput) {
    try {
      const newMessage = new Message();
      newMessage.message = input.message;
      newMessage.receiverId = input.receiverId;
      newMessage.senderId = input.senderId;
      newMessage.productId = input.productId;
      newMessage.purchaseId = input.purchaseId;
      newMessage.messageType = MessageTypeEnum.SYSTEM;
      newMessage.readAt = null;

      const _newMessage = await this.messageRepository.save(newMessage);
      //If the receiver is an organization, the email is sent to the owner instead
      const receiver = await this.userRepository.findOneBy({
        id: input.receiverId,
      });
      let mailReceiver = receiver;
      if (receiver.type === UserType.BUSINESS) {
        const owner = await this.userService.findOrganizationOwner(receiver);
        mailReceiver = owner;
      }

      //Send mail if user allows it
      const product = await this.productRepository.findOneBy({
        id: input.productId,
      });
      if (mailReceiver.notifyOnPurchaseUpdate) {
        this.mailService.sendSystemMessageEmail({
          product,
          receiver: mailReceiver,
        });
      }

      return _newMessage;
    } catch (e) {
      this.logger.error('Invalid system conversation', {
        ...input,
        e,
      });
      throw InternalServerException('Invalid system conversation');
    }
  }

  async markAsRead(input: MarkAsReadInput, currentUserId: string) {
    const unreadMessages = await this.messageRepository.find({
      where: {
        productId: input.productId,
        purchaseId: input.purchaseId,
        senderId: input.otherUserId,
        receiverId: currentUserId,
        readAt: IsNull(),
      },
    });
    unreadMessages.forEach((message) => (message.readAt = new Date()));
    return await this.messageRepository.save(unreadMessages);
  }

  async getUnreadConversationsCount(currentUserId: string) {
    const conversations = await this.getConversations(
      { type: GetConversationsType.BUYING_AND_SELLING },
      currentUserId,
    );
    const totalUnread = conversations.reduce(
      (acc, curr) =>
        acc + (curr.senderId !== currentUserId && !curr.readAt ? 1 : 0),
      0,
    );
    return totalUnread;
  }

  async deleteMany(messages: Message[]) {
    return await Promise.all(
      messages.map((message) => this.delete(message.id)),
    );
  }
  async delete(id: string) {
    const message = await this.messageRepository.findOne({
      where: {
        id,
      },
    });
    return await this.messageRepository.remove(message);
  }

  @Cron(
    process.env.NODE_ENV === 'production'
      ? CronExpression.EVERY_HOUR
      : CronExpression.EVERY_MINUTE,
  )
  async notifyOnUserMessages() {
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
        WITH relevantIds AS (
          SELECT m."receiverId", m."productId"
          FROM message m
          INNER JOIN "user" receiver ON m."receiverId" = receiver.id AND receiver."notifyOnMessage" = TRUE
          WHERE
            "readAt" IS NULL
            AND (receiver."notifiedOnMessageAt" < m."createdAt" OR receiver."notifiedOnMessageAt" IS NULL)
            AND m."messageType" = '${MessageTypeEnum.USER}'::message_messagetype_enum
          GROUP by "receiverId", "senderId", "productId")
        SELECT u.id as "receiverId", u.email as "receiverEmail", u.type as "userType", p.title as "productTitle" from relevantIds ri
        INNER JOIN "user" u ON ri."receiverId" = u.id
        INNER JOIN product p ON ri."productId" = p.id
        `);

    //send mail to all
    Promise.all(
      receivers.map(async (receiver) => {
        let receiverEmail = receiver.receiverEmail;
        logger.info('Notifying user of message on product', {
          productTitle: receiver.productTitle,
          userId: receiver.receiverId,
          userEmail: receiver.receiverEmail,
          userType: receiver.userType,
        });
        if (receiver.userType === UserType.BUSINESS) {
          const owner = await this.userRepository.findOne({
            where: {
              organizations: {
                id: receiver.receiverId,
              },
            },
          });
          receiverEmail = owner.email;
        }
        this.mailService.sendUserMessageEmail({
          productTitle: receiver.productTitle,
          receiverEmail,
        });
      }),
    );

    const receiverIds = receivers.map((receiver) => receiver.receiverId);

    //update all receivers
    this.userRepository.update(
      { id: In(receiverIds) },
      { notifiedOnMessageAt: new Date() },
    );
    return;
  }
}
