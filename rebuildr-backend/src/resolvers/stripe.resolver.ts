import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { StripeService } from 'src/services/stripe.service';

@Resolver()
export class StripeResolver {
  constructor(private stripeService: StripeService) {}

  @Mutation(() => Boolean)
  async deleteConnectedAccount(@Args('id') id: string) {
    return await this.stripeService.delete(id);
  }
}
