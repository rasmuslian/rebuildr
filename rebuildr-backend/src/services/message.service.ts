import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/entities/message.entity';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
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
