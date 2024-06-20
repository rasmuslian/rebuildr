import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/entities/message.entity';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';

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
    return await this.messageRepository.find({
      where: [
        {
          senderId: input.primaryUserId,
          receiverId: input.otherUserId,
          productId: input.productId,
        },
        {
          senderId: input.otherUserId,
          receiverId: input.primaryUserId,
          productId: input.productId,
        },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  async findConversations(input: { id: string }) {
    return await this.dataSource.query<
      { otherUser: User; product: Product; latestMessageAt: Date }[]
    >(`
    SELECT
      row_to_json(other) as "otherUser",
      row_to_json(product) as product,
      max(conversations.created_at) as "latestMessageAt"
    FROM (
      SELECT
        CASE WHEN '${input.id}' = receiver_id THEN
          sender_id
        ELSE
          receiver_id
      END other_user_id,
      *
      FROM
        message m
    WHERE
      receiver_id = '${input.id}' OR sender_id = '${input.id}') AS conversations
    LEFT JOIN "user" other on other.id = other_user_id
    LEFT JOIN product on product.id = product_id
    GROUP BY
      other.id,
      product.id
    ORDER BY
      "latestMessageAt"
    `);
  }

  async create(input: {
    senderId: string;
    receiverId: string;
    productId: string;
    body: string;
  }) {
    const message = new Message();

    const [receiver, sender, product] = await Promise.all([
      this.userRepository.findOneByOrFail({ id: input.receiverId }),
      this.userRepository.findOneByOrFail({ id: input.senderId }),
      this.productRepository.findOneByOrFail({ id: input.productId }),
    ]).catch(() => {
      throw new Error('Invalid conversation');
    });

    message.receiver = receiver;
    message.sender = sender;
    message.product = product;
    message.body = input.body;
    return await this.messageRepository.save(message);
  }
}
