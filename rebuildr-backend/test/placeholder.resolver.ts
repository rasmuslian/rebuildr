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
  @Query(() => PlaceholderResponse)
  async placeholderQuery() {
    console.log('This query is a placeholder');
    return { message: 'Returning placeholder' };
  }
}
