import {
  Args,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NewsletterCompetition } from 'src/entities/newsletter-competition.entity';
import { NewsletterCompetitionService } from 'src/services/newsletter-competition.service';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/entities/user.entity';
import { FileInputType } from './file.resolver';

@InputType()
export class CmsUpdateNewsletterCompetitionInput {
  @Field()
  title: string;

  @Field()
  productTitle: string;

  @Field()
  productValue: string;

  @Field()
  bodyText: string;

  @Field(() => Date)
  nextDrawDate: Date;

  @Field(() => FileInputType, { nullable: true })
  productImage?: FileInputType;
}

@ObjectType()
export class CmsUpdateNewsletterCompetitionResponse {
  @Field(() => NewsletterCompetition)
  newsletterCompetition: NewsletterCompetition;

  @Field(() => String, { nullable: true })
  imagePutUrl?: string;
}

@Resolver(() => NewsletterCompetition)
export class NewsletterCompetitionResolver {
  constructor(
    private newsletterCompetitionService: NewsletterCompetitionService,
  ) {}

  @Query(() => NewsletterCompetition)
  async newsletterCompetition(): Promise<NewsletterCompetition> {
    return this.newsletterCompetitionService.get();
  }

  @Mutation(() => CmsUpdateNewsletterCompetitionResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsUpdateNewsletterCompetition(
    @Args('input') input: CmsUpdateNewsletterCompetitionInput,
  ): Promise<CmsUpdateNewsletterCompetitionResponse> {
    return this.newsletterCompetitionService.update(input);
  }
}
