import { Injectable } from '@nestjs/common';
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
import { Article } from 'src/entities/article.entity';
import { ArticleService } from 'src/services/article.service';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/entities/user.entity';

@InputType()
export class CmsCreateArticleInput {
  @Field()
  title: string;

  @Field()
  body: string;
}
@InputType()
export class CmsUpdateArticleInput {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  body: string;
}

@InputType()
export class CmsListArticlesInput {
  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  pageSize?: number;
}

@ObjectType()
export class CmsListArticlesResponse {
  @Field(() => [Article])
  articles: Article[];

  @Field(() => Int)
  total: number;
}

@Resolver()
@Injectable()
export class ArticleResolver {
  constructor(private articleService: ArticleService) {}

  @Query(() => Article)
  async article(@Args('id') id: string) {
    return await this.articleService.findOne(id);
  }

  @Mutation(() => Article)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsCreateArticle(
    @Args('input') input: CmsCreateArticleInput,
  ): Promise<Article> {
    return this.articleService.createArticle(input);
  }

  @Mutation(() => Article)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsUpdateArticle(
    @Args('input') input: CmsUpdateArticleInput,
  ): Promise<Article> {
    return this.articleService.updateArticle(input);
  }

  @Query(() => CmsListArticlesResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsListArticles(
    @Args('input') input: CmsListArticlesInput,
  ): Promise<CmsListArticlesResponse> {
    return await this.articleService.cmsListArticles(input);
  }
}
