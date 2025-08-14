import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message, MessageTypeEnum } from 'src/entities/message.entity';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { User } from 'src/entities/user.entity';
import { BadUserInputException } from 'src/exceptions';
import {
  GetConversationsInput,
  GetConversationsType,
} from 'src/resolvers/message.resolver';
import { DataSource, IsNull, Repository } from 'typeorm';
import { PurchaseService } from './purchase.service';

export interface SystemMessageInput {
  productId: string;
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
  ) {}

  async getConversation(
    productId: string,
    otherUserId: string,
    currentUserId: string,
  ) {
    const result = await this.messageRepository.find({
      where: [
        {
          product: { id: productId },
          receiver: { id: currentUserId },
          sender: { id: otherUserId },
        },
        {
          product: { id: productId },
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
        'm.message_id as id, m.message_message as message, m."message_createdAt" as "createdAt", m."message_senderId" as "senderId", m."message_receiverId" as "receiverId", m."message_productId" as "productId", m."message_readAt" as "readAt", m."message_messageType" as "messageType"',
      )
      .from((qb) => {
        qb.select('message')
          .addSelect(
            `row_number() over(
              partition by message."productId",
              CASE 
                WHEN message."senderId" = '${currentUserId}' THEN message."receiverId" 
                ELSE message."senderId" 
              END
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
      .getRawMany();

    return conversations;
  }

  async create(input: {
    senderId: string;
    receiverId: string;
    productId: string;
    message: string;
  }) {
    if (input.receiverId === input.senderId) {
      throw BadUserInputException('Cannot send message on own product');
    }
    const message = new Message();

    const [receiver, sender, product] = await Promise.all([
      this.userRepository.findOneByOrFail({ id: input.receiverId }),
      this.userRepository.findOneByOrFail({ id: input.senderId }),
      this.productRepository.findOneByOrFail({ id: input.productId }),
      this.purchaseRepository.findOne({
        where: { productId: input.productId },
      }),
    ]).catch(() => {
      throw BadUserInputException('Invalid conversation');
    });

    this.purchaseService.handleSellerResponse(
      input.productId,
      input.senderId,
      input.receiverId,
    );

    message.receiver = receiver;
    message.sender = sender;
    message.product = product;
    message.message = input.message;
    return await this.messageRepository.save(message);
  }

  async sendSystemMessage(input: SystemMessageInput) {
    const [receiver, sender, product] = await Promise.all([
      this.userRepository.findOneByOrFail({ id: input.receiverId }),
      this.userRepository.findOneByOrFail({ id: input.senderId }),
      this.productRepository.findOneByOrFail({ id: input.productId }),
    ]).catch(() => {
      throw BadUserInputException('Invalid conversation');
    });

    const newMessage = new Message();

    newMessage.message = input.message;
    newMessage.receiver = receiver;
    newMessage.sender = sender;
    newMessage.product = product;
    newMessage.messageType = MessageTypeEnum.SYSTEM;
    newMessage.readAt = null;

    const _newMessage = await this.messageRepository.save(newMessage);

    return _newMessage;
  }

  async markAsRead(
    productId: string,
    otherUserId: string,
    currentUserId: string,
  ) {
    const unreadMessages = await this.messageRepository.find({
      where: {
        product: { id: productId },
        senderId: otherUserId,
        receiverId: currentUserId,
        readAt: IsNull(),
      },
    });
    unreadMessages.forEach((message) => (message.readAt = new Date()));
    return await this.messageRepository.save(unreadMessages);
  }

  async getUnreadMessagesCount(userId: string) {
    return await this.messageRepository.count({
      where: {
        receiver: { id: userId },
        readAt: IsNull(),
      },
    });
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
}
