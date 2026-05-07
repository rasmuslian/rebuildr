import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message, MessageTypeEnum } from 'src/entities/message.entity';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { User, UserType } from 'src/entities/user.entity';
import { BadUserInputException } from 'src/exceptions';
import {
  CmsListSystemMessagesInput,
  CmsListSystemMessagesResponse,
  CreateMessageInput,
} from 'src/resolvers/message.resolver';
import { ILike, IsNull, Repository } from 'typeorm';
import { MailService } from './mail.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserService } from './user.service';
import { FileService } from './file.service';
import { Conversation } from 'src/entities/conversation.entity';
import { PurchaseService } from './purchase.service';

export interface SystemMessageInput {
  productId: string;
  purchaseId: string;
  buyerId: string;
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
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    @Inject(forwardRef(() => PurchaseService))
    private purchaseService: PurchaseService,
    private mailService: MailService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private fileService: FileService,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  //if conversationId is present, we add this message to it.
  //otherwise we create a new conversation and add this message to it
  async create(input: CreateMessageInput, senderId: string) {
    //create the message
    const message = new Message();
    message.senderId = senderId;
    message.message = input.message;
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

    let conversation: Conversation;
    if (input.conversationId) {
      conversation = await this.conversationRepository.findOne({
        where: [
          {
            id: input.conversationId,
            buyerId: senderId,
          },
          {
            id: input.conversationId,
            product: { sellerId: senderId },
          },
        ],
      });
      if (!conversation) {
        this.logger.error({
          message: 'create: Given conversation not found',
          input,
        });
        throw BadUserInputException('Invalid conversation');
      }
    } else {
      //Initiate new conversation. This is done by the BUYER meaning senderId = buyer.id
      const product = await this.productRepository.findOne({
        where: { id: input.productId },
      });
      console.log('product :>> ', product);
      if (!product || senderId === product.sellerId) {
        this.logger.error({
          message:
            'create: trying to initiate a conversation where the sender is both the buyer and the seller',
          input,
        });
        throw BadUserInputException('Invalid conversation');
      }

      const newConversation = new Conversation();
      //It will be the buyer who initiates the conversation
      newConversation.buyerId = senderId;
      newConversation.productId = input.productId;
      newConversation.buyerReadAt = new Date();
      console.log('newConversation :>> ', newConversation);

      conversation = await this.conversationRepository.save(newConversation);
    }

    if (conversation.purchaseId) {
      await this.purchaseService.handleSellerResponse(conversation.purchaseId);
    }

    message.conversation = conversation;
    return await this.messageRepository.save(message);
  }

  async sendSystemMessage(input: SystemMessageInput) {
    //create new message
    const message = new Message();
    message.message = input.message;
    //setting receiverId means only the receiver can read this message
    message.receiverId = input.receiverId;
    message.messageType = MessageTypeEnum.SYSTEM;

    let conversation = await this.conversationRepository.findOne({
      where: { purchaseId: input.purchaseId },
    });

    if (!conversation) {
      //Find the latest conversation on productId with buyerId which does not yet have a purchase
      //There could potentially be more than one but we take the latest conversation
      //and connect it to the purchaseId. This convo and its earlies messages are now part of this
      //purchase
      const latestConversation = await this.conversationRepository.findOne({
        where: [
          {
            purchaseId: IsNull(),
            buyerId: input.buyerId,
            productId: input.productId,
          },
        ],
        order: { createdAt: 'DESC' },
      });
      if (latestConversation) {
        latestConversation.purchaseId = input.purchaseId;
        conversation =
          await this.conversationRepository.save(latestConversation);
      } else {
        const newConversation = new Conversation();
        //It will be the buyer who initiates the conversation
        newConversation.buyerId = input.buyerId;
        newConversation.productId = input.productId;
        newConversation.purchaseId = input.purchaseId;
        conversation = await this.conversationRepository.save(newConversation);
      }
    }

    message.conversationId = conversation.id;

    try {
      //--------------- eMail Part --------------------------
      //If the receiver is an organization, the email is sent to the owner instead
      const receiver = await this.userRepository.findOneBy({
        id: input.receiverId,
      });
      if (!receiver) {
        this.logger.error({
          message: 'sendSystemMessage: receiver not found',
          input,
        });
        throw new Error('Receiver not found');
      }
      let mailReceiver = receiver;
      if (receiver.type === UserType.BUSINESS) {
        const owner = await this.userService.findOrganizationOwner(receiver);
        if (!owner) {
          this.logger.error({
            message: 'sendSystemMessage: receiver.owner not found',
            input,
          });
          throw new Error('Receiver not found');
        }
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
    } catch {
      /**empty */
    }
    //---------------------------------------------

    return await this.messageRepository.save(message);
  }

  async cmsListSystemMessages(
    input: CmsListSystemMessagesInput,
  ): Promise<CmsListSystemMessagesResponse> {
    const { page = 0, pageSize = 10, searchString = '' } = input;
    const skip = Math.max(0, pageSize * page);

    const [messages, total] = await this.messageRepository.findAndCount({
      where: [
        {
          messageType: MessageTypeEnum.SYSTEM,
          receiver: { username: ILike(`%${searchString}%`) },
        },
        {
          messageType: MessageTypeEnum.SYSTEM,
          receiver: { email: ILike(`%${searchString}%`) },
        },
        {
          messageType: MessageTypeEnum.SYSTEM,
          message: ILike(`%${searchString}%`),
        },
      ],
      relations: { receiver: true, conversation: true },
      order: { createdAt: 'DESC' },
      take: pageSize,
      skip,
    });

    return { messages, total };
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
