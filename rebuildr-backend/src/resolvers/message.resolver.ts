import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Field,
  InputType,
  Int,
  Mutation,
  Parent,
  Query,
  registerEnumType,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthedUserType } from 'src/auth/constants';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { GqlOptionalAuthGuard } from 'src/auth/gql-optional-auth.guard';
import { IProductLoaders } from 'src/dataloaders/product.loader';
import { IUserLoaders } from 'src/dataloaders/user.loader';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Message } from 'src/entities/message.entity';
import { Product } from 'src/entities/product.entity';
import { User } from 'src/entities/user.entity';
import { MessageService } from 'src/services/message.service';

@InputType()
class CreateMessageInput {
  @Field()
  receiverId: string;
  @Field()
  productId: string;
  @Field()
  message: string;
}

@InputType()
class GetConversationInput {
  @Field()
  otherUserId: string;

  @Field()
  productId: string;
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
export class GetConversationsInput {
  @Field(() => GetConversationsType)
  type: GetConversationsType;

  @Field({ nullable: true })
  productId?: string;
}

@InputType()
export class MarkAsReadInput {
  @Field()
  otherUserId: string;

  @Field()
  productId: string;

  @Field()
  markAsRead: boolean;
}

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
  ) {}

  @Query(() => [Message])
  @UseGuards(GqlAuthGuard)
  async getConversation(
    @Args('input') input: GetConversationInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return this.messageService.getConversation(
      input.productId,
      input.otherUserId,
      user.id,
    );
  }

  @Query(() => [Message])
  @UseGuards(GqlAuthGuard)
  async getConversations(
    @Args('input') input: GetConversationsInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.messageService.getConversations(input, user.id);
  }

  @Query(() => Int)
  @UseGuards(GqlOptionalAuthGuard)
  async getUnreadConversationsCount(@CurrentUser() user?: User) {
    if (!user) {
      return 0;
    }
    return await this.messageService.getUnreadConversationsCount(user.id);
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

  @Mutation(() => [Message])
  @UseGuards(GqlAuthGuard)
  async markConversationAsRead(
    @Args('input') input: MarkAsReadInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return this.messageService.markAsRead(
      input.productId,
      input.otherUserId,
      user.id,
    );
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
