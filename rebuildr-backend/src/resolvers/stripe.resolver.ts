import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/entities/user.entity';
import { StripeService } from 'src/services/stripe.service';

@Resolver()
export class StripeResolver {
  constructor(private stripeService: StripeService) {}

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async deleteConnectedAccount(@Args('id') id: string) {
    return await this.stripeService.delete(id);
  }
}
