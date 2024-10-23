import { Logger } from '@nestjs/common';
import { Field, ObjectType, Query, Resolver } from '@nestjs/graphql';

/*
  Tests need atleast on Query() among all resolvers. This resolver exist so that
  tests which user resolvers that don't have any Query() can include this resolver
  as a placeholder.
*/

@ObjectType()
class PlaceholderResponse {
  @Field()
  message: string;
}

@Resolver()
export class PlaceholderResolver {
  private readonly logger = new Logger(PlaceholderResolver.name);

  @Query(() => PlaceholderResponse)
  async placeholderQuery() {
    this.logger.debug('This query is a placeholder');
    return { message: 'Returning placeholder' };
  }
}
