import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  InputType,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { IUserLoaders } from 'src/dataloaders/user.loader';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Message } from 'src/entities/message.entity';
import { User, UserRoleEnum } from 'src/entities/user.entity';
import { MessageService } from 'src/services/message.service';
import {
  ChatActionEnum,
  CmsPreviewSystemMessageOptions,
  SystemMessageRoleEnum,
  SystemMessageStepEnum,
  SystemMessagesService,
} from 'src/services/system-messages.service';
import { TransportationEnum } from 'src/entities/purchase.entity';
import { ShippingProviderEnum } from 'src/entities/shipping-price.entity';
import { FileInputType } from './file.resolver';
import { IMessageLoaders } from 'src/dataloaders/message.loader';
import { File } from 'src/entities/file.entity';

@InputType()
export class CmsPreviewSystemMessageInput
  implements CmsPreviewSystemMessageOptions
{
  @Field(() => SystemMessageStepEnum)
  step: SystemMessageStepEnum;

  @Field(() => SystemMessageRoleEnum)
  role: SystemMessageRoleEnum;

  @Field(() => TransportationEnum, { nullable: true })
  transportation?: TransportationEnum;

  @Field({ nullable: true })
  isFree?: boolean;

  @Field({ nullable: true })
  firstSale?: boolean;

  @Field(() => ShippingProviderEnum, { nullable: true })
  provider?: ShippingProviderEnum;

  @Field({ nullable: true })
  decision?: string;

  @Field({ nullable: true })
  showAddPayoutText?: boolean;
}

@InputType()
export class CreateMessageInput {
  //This message is targeted towards an existing conversation
  @Field({ nullable: true })
  conversationId?: string;

  //This is the first message, outside any existing conversations
  @Field({ nullable: true })
  productId?: string;

  //Message content
  @Field()
  message: string;
  @Field(() => [FileInputType], { nullable: true })
  images?: FileInputType[];
  @Field(() => [FileInputType], { nullable: true })
  documents?: FileInputType[];
}

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
    private systemMessagesService: SystemMessagesService,
  ) {}

  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsPreviewSystemMessage(
    @Args('input') input: CmsPreviewSystemMessageInput,
  ): Promise<string> {
    return this.systemMessagesService.cmsPreviewSystemMessage(input);
  }

  @Query(() => [ChatActionEnum])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  cmsListChatActions(): ChatActionEnum[] {
    return Object.values(ChatActionEnum);
  }

  @Mutation(() => Message)
  @UseGuards(GqlAuthGuard)
  async createMessage(
    @CurrentUser() _user: AuthedUserType,
    @Args('input') input: CreateMessageInput,
  ) {
    return this.messageService.create(input, _user.id);
  }

  @ResolveField(() => User, { nullable: true })
  async sender(
    @Parent() message: Message,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    if (!message.senderId) {
      return null;
    }
    return await userLoaders.getUserLoader.load(message.senderId);
  }

  @ResolveField(() => User, { nullable: true })
  async receiver(
    @Parent() message: Message,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    if (!message.receiverId) {
      return null;
    }
    return await userLoaders.getUserLoader.load(message.receiverId);
  }

  @ResolveField(() => [File])
  async images(
    @Parent() message: Message,
    @Context('messageLoaders') messageLoaders: IMessageLoaders,
  ): Promise<File[]> {
    return await messageLoaders.imagesLoader.load(message.id);
  }

  @ResolveField(() => [File])
  async documents(
    @Parent() message: Message,
    @Context('messageLoaders') messageLoaders: IMessageLoaders,
  ): Promise<File[]> {
    return await messageLoaders.documentsLoader.load(message.id);
  }
}
