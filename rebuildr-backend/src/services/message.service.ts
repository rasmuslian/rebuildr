import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Message, MessageTypeEnum } from 'src/entities/message.entity';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { BadUserInputException } from 'src/exceptions';
import { GetConversationsType } from 'src/resolvers/message.resolver';
import { DataSource, Repository } from 'typeorm';

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
  ) {}

  async findConversation(input: {
    primaryUserId: string;
    otherUserId: string;
    productId: string;
  }) {
    const conversationRaw = await this.dataSource.query<
      {
        otherUser: User;
        messages: Message[];
      }[]
    >(`
    SELECT
	    to_json(other) as "otherUser",
	    ARRAY_AGG(to_json(m)) as messages
    FROM (
	    SELECT
		    CASE WHEN '${input.primaryUserId}' = "receiverId" THEN
			    "senderId"
		    ELSE
			    "receiverId"
	    	END "otherUserId",
		      m
	    FROM
		    message m
	    WHERE ("senderId" = '${input.primaryUserId}'
		    AND "receiverId" = '${input.otherUserId}')
	      OR("receiverId" = '${input.primaryUserId}'
		    AND "senderId" = '${input.otherUserId}')
	      AND "productId" = '${input.productId}') AS messages
      LEFT JOIN "user" other on other.id = messages."otherUserId"
      GROUP by other.id
    `);
    return conversationRaw.map((data) => {
      return {
        otherUser: plainToInstance(User, data.otherUser),
        messages: data.messages.map((message) =>
          plainToInstance(Message, message),
        ),
      };
    })[0];
  }

  async findConversations(input: { id: string }) {
    const conversationsRaw = await this.dataSource.query<
      { otherUser: User; product: Product; latestMessageAt: Date }[]
    >(`
    SELECT
      row_to_json(other) as "otherUser",
      row_to_json(product) as product,
      max(conversations."createdAt") as "latestMessageAt"
    FROM (
      SELECT
        CASE WHEN '${input.id}' = "receiverId" THEN
          "senderId"
        ELSE
          "receiverId"
        END "otherUserId",
        *
      FROM
        message m
      WHERE
        "receiverId" = '${input.id}' OR "senderId" = '${input.id}') AS conversations
    LEFT JOIN "user" other on other.id = "otherUserId"
    LEFT JOIN product on product.id = "productId"
    GROUP BY
      other.id,
      product.id
    ORDER BY
      "latestMessageAt"
    `);

    return conversationsRaw.map((conversation) => ({
      otherUser: plainToInstance(User, conversation.otherUser),
      product: plainToInstance(Product, conversation.product),
      latestMessageAt: conversation.latestMessageAt,
    }));
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
    user: User,
    type: GetConversationsType,
  ): Promise<Message[]> {
    const conversations = await this.dataSource
      .createQueryBuilder()
      .select(
        'm.message_id as id, m.message_message as message, m."message_createdAt" as "createdAt", m."message_senderId" as "senderId", m."message_receiverId" as "receiverId", m."message_productId" as "productId", m."message_readAt" as "readAt"',
      )
      .from((qb) => {
        qb.select('message')
          .addSelect(
            `row_number() over(
              partition by message."productId",
              CASE 
                WHEN message."senderId" = '${user.id}' THEN message."receiverId" 
                ELSE message."senderId" 
              END
              order by message."createdAt" desc
              )`,
            'rank',
          )
          .from(Message, 'message');

        if (type === GetConversationsType.SELLING) {
          qb.innerJoin(
            'message.product',
            'product',
            'product.sellerId = :userId',
            {
              userId: user.id,
            },
          );
        }

        if (type === GetConversationsType.BUYING) {
          qb.innerJoin(
            'message.product',
            'product',
            'product.sellerId != :userId',
            {
              userId: user.id,
            },
          );
        }

        qb.where(
          `message."receiverId" = :userId OR (message."senderId" = :userId AND message."messageType" = '${MessageTypeEnum.USER}'::message_messagetype_enum)`,
          {
            userId: user.id,
          },
        );

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
    ]).catch(() => {
      throw BadUserInputException('Invalid conversation');
    });

    message.receiver = receiver;
    message.sender = sender;
    message.product = product;
    message.message = input.message;
    return await this.messageRepository.save(message);
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
