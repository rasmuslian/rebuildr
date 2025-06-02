import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Message } from 'src/entities/message.entity';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { BadUserInputException } from 'src/exceptions';
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

  async create(input: {
    senderId: string;
    receiverId: string;
    productId: string;
    body: string;
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
    message.body = input.body;
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
