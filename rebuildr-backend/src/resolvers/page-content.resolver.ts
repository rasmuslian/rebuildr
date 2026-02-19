import {
  Query,
  Resolver,
  Args,
  InputType,
  Field,
  Mutation,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { PageContent } from 'src/entities/page-content.entity';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/entities/user.entity';
import { PageContentService } from 'src/services/page-content.service';
import { PageEnum } from 'src/constants/enums';

@InputType()
export class ListPageContentInput {
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  pageSize?: number;
}

@ObjectType()
export class ListPageContentResponse {
  @Field(() => [PageContent])
  pages: PageContent[];

  @Field(() => Int)
  total: number;
}

@InputType()
export class UpdatePageContentInput {
  @Field()
  id: string;

  @Field()
  heroHtml: string;
}

@Resolver(() => PageContent)
export class PageContentResolver {
  constructor(private pageContentService: PageContentService) {}

  @Query(() => PageContent)
  async pageContentById(@Args('id') id: string) {
    return await this.pageContentService.findById(id);
  }

  @Query(() => PageContent)
  async pageContentByPage(@Args('page') page: PageEnum) {
    return await this.pageContentService.findByPage(page);
  }

  @Query(() => ListPageContentResponse)
  async listPageContents(
    @Args('input') input: ListPageContentInput,
  ): Promise<ListPageContentResponse> {
    return await this.pageContentService.findAll(input);
  }

  @Mutation(() => PageContent)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async updatePageContent(
    @Args('input') inpput: UpdatePageContentInput,
  ): Promise<PageContent> {
    return this.pageContentService.update(inpput);
  }
}
