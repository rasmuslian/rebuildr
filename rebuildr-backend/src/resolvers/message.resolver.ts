import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Parent,
  Query,
  registerEnumType,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { IProductLoaders } from 'src/dataloaders/product.loader';
import { IUserLoaders } from 'src/dataloaders/user.loader';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Message } from 'src/entities/message.entity';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { MessageService } from 'src/services/message.service';

@InputType()
class ConversationInput {
  @Field()
  otherUserId: string;

  @Field()
  productId: string;
}

@ObjectType()
class ConversationResponse {
  @Field(() => User)
  otherUser: User;

  @Field(() => [Message])
  messages: Message[];
}

@InputType()
class CreateMessageInput {
  @Field()
  receiverId: string;
  @Field()
  productId: string;
  @Field()
  message: string;
}

@ObjectType()
class ConversationOverviewResponse {
  @Field(() => User)
  otherUser: User;

  @Field(() => Product)
  product: Product;

  @Field(() => Date)
  latestMessageAt: Date;
}

export enum GetConversationsType {
  SELLING = 'SELLING',
  BUYING = 'BUYING',
  BUYING_AND_SELLING = 'BUYING_AND_SELLING',
}

registerEnumType(GetConversationsType, {
  name: 'GetConversationsType',
});

@InputType()
class GetConversationsInput {
  @Field(() => GetConversationsType)
  type: GetConversationsType;
}

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
  ) {}

  @Query(() => ConversationResponse)
  @UseGuards(GqlAuthGuard)
  async conversation(
    @CurrentUser() _user: AuthedUserType,
    @Args('input') input: ConversationInput,
  ) {
    return this.messageService.findConversation({
      primaryUserId: _user.id,
      otherUserId: input.otherUserId,
      productId: input.productId,
    });
  }

  @Query(() => [ConversationOverviewResponse])
  @UseGuards(GqlAuthGuard)
  async conversations(@CurrentUser() _user: AuthedUserType) {
    return this.messageService.findConversations({ id: _user.id });
  }

  @Query(() => [Message])
  @UseGuards(GqlAuthGuard)
  async getConversations(
    @Args('input') input: GetConversationsInput,
    @CurrentUser() user: User,
  ) {
    return await this.messageService.getConversations(user, input.type);
  }

  @Mutation(() => Message)
  @UseGuards(GqlAuthGuard)
  async createMessage(
    @CurrentUser() _user: AuthedUserType,
    @Args('input') input: CreateMessageInput,
  ) {
    return this.messageService.create({
      senderId: _user.id,
      receiverId: input.receiverId,
      productId: input.productId,
      message: input.message,
    });
  }

  @ResolveField(() => Product)
  async product(
    @Parent() message: Message,
    @Context('productLoaders') productLoaders: IProductLoaders,
  ) {
    return await productLoaders.getProduct.load(message.productId);
  }

  @ResolveField(() => User)
  async sender(
    @Parent() message: Message,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    return await userLoaders.getUserLoader.load(message.senderId);
  }

  @ResolveField(() => User)
  async receiver(
    @Parent() message: Message,
    @Context('userLoaders') userLoaders: IUserLoaders,
  ) {
    return await userLoaders.getUserLoader.load(message.receiverId);
  }
}
