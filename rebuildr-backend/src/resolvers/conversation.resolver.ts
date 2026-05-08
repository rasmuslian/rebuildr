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
import { IConversationLoaders } from 'src/dataloaders/conversation.loader';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Conversation } from 'src/entities/conversation.entity';
import { Message } from 'src/entities/message.entity';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { User } from 'src/entities/user.entity';
import { ConversationService } from 'src/services/conversation.service';
@InputType()
export class GetConversationInput {
  @Field()
  id: string;
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
  conversationId: string;
}

@Resolver(() => Conversation)
export class ConversationResolver {
  constructor(
    @Inject(forwardRef(() => ConversationService))
    private conversationService: ConversationService,
  ) {}

  @Query(() => Conversation)
  @UseGuards(GqlAuthGuard)
  async getConversation(
    @Args('input') input: GetConversationInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return this.conversationService.getConversation(input.id, user.id);
  }

  @Query(() => [Conversation])
  @UseGuards(GqlAuthGuard)
  async getConversations(
    @Args('input') input: GetConversationsInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await this.conversationService.getConversations(input, user.id);
  }

  @Query(() => Int)
  @UseGuards(GqlOptionalAuthGuard)
  async getUnreadConversationsCount(@CurrentUser() user?: AuthedUserType) {
    if (!user) {
      return 0;
    }
    return await this.conversationService.getUnreadConversationsCount(user.id);
  }

  @Mutation(() => Conversation)
  @UseGuards(GqlAuthGuard)
  async markConversationAsRead(
    @Args('input') input: MarkAsReadInput,
    @CurrentUser() user: AuthedUserType,
  ) {
    return this.conversationService.markAsRead(input, user.id);
  }

  @ResolveField(() => Product)
  async product(
    @Parent() conversation: Conversation,
    @Context('conversationLoaders') conversationLoaders: IConversationLoaders,
  ) {
    return await conversationLoaders.productLoader.load(conversation.id);
  }

  @ResolveField(() => User)
  async buyer(
    @Parent() conversation: Conversation,
    @Context('conversationLoaders') conversationLoaders: IConversationLoaders,
  ) {
    return await conversationLoaders.buyerLoader.load(conversation.id);
  }

  @ResolveField(() => Purchase, { nullable: true })
  async purchase(
    @Parent() conversation: Conversation,
    @Context('conversationLoaders') conversationLoaders: IConversationLoaders,
  ) {
    return await conversationLoaders.purchaseLoader.load(conversation.id);
  }
  @ResolveField(() => [Message])
  async messages(
    @Parent() conversation: Conversation,
    @Context('conversationLoaders') conversationLoaders: IConversationLoaders,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await conversationLoaders.messagesLoader.load({
      conversationId: conversation.id,
      receiverId: user.id,
    });
  }

  @ResolveField(() => Message, { nullable: true })
  async lastMessage(
    @Parent() conversation: Conversation,
    @Context('conversationLoaders') conversationLoaders: IConversationLoaders,
    @CurrentUser() user: AuthedUserType,
  ) {
    return await conversationLoaders.lastMessageLoader.load({
      conversationId: conversation.id,
      receiverId: user.id,
    });
  }
}
