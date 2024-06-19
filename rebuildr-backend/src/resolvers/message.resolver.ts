import { UseGuards } from '@nestjs/common';
import { Args, Field, InputType, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gqlAuth.guard';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { Message } from 'src/entities/message.entity';
import { User } from 'src/entities/user.entity';
import { MessageService } from 'src/services/message.service';

@InputType()
class CreateMessageInput {
  @Field()
  receiverId: string;
  @Field()
  productId: string;
  @Field()
  body: string;
}

@Resolver()
export class MessageResolver {
  constructor(private messageService: MessageService) {}

  @Mutation(() => Message)
  @UseGuards(GqlAuthGuard)
  async createMessage(
    @CurrentUser() _user: User,
    @Args('input') input: CreateMessageInput,
  ) {
    return this.messageService.create({
      senderId: _user.id,
      receiverId: input.receiverId,
      productId: input.productId,
      body: input.body,
    });
  }
}
