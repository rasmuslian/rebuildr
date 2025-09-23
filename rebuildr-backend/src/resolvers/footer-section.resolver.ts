import {
  Query,
  Resolver,
  Args,
  InputType,
  Field,
  ResolveField,
  Root,
  Mutation,
  Int,
} from '@nestjs/graphql';
import { FooterSection } from 'src/entities/footer-section.entity';
import { FooterSectionService } from 'src/services/footer-section.service';
import { ArticleFooterSection } from 'src/entities/article-footer-section.entity';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/entities/user.entity';
import { ArticleFooerSectionService } from 'src/services/article-footer-section.service';

@InputType()
export class ArticleOrderInput {
  @Field()
  articleId: string;

  @Field(() => Int)
  orderIndex: number;
}

@InputType()
export class CmsCreateFooterSectionInput {
  @Field()
  title: string;

  @Field()
  orderIndex: number;

  @Field(() => [ArticleOrderInput])
  articles: ArticleOrderInput[];
}

@InputType()
export class CmsUpdateFooterSectionInput {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  orderIndex: number;

  @Field(() => [ArticleOrderInput])
  articles: ArticleOrderInput[];
}

@Resolver(() => FooterSection)
export class FooterSectionResolver {
  constructor(
    private footerSectionService: FooterSectionService,
    private articleFooerSectionService: ArticleFooerSectionService,
  ) {}

  @Query(() => FooterSection)
  async footerSection(@Args('id') id: string) {
    return await this.footerSectionService.findOne(id);
  }

  @Mutation(() => FooterSection)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsCreateFooterSection(
    @Args('input') input: CmsCreateFooterSectionInput,
  ): Promise<FooterSection> {
    return this.footerSectionService.createFooterSection(input);
  }

  @Mutation(() => FooterSection)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsUpdateFooterSection(
    @Args('input') input: CmsUpdateFooterSectionInput,
  ): Promise<FooterSection> {
    return this.footerSectionService.updateFooterSection(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsDeleteFooterSection(
    @Args('footerSectionId') footerSectionId: string,
  ): Promise<Boolean> {
    return this.footerSectionService.deleteFooterSection(footerSectionId);
  }

  @Query(() => [FooterSection])
  async listFooterSection(): Promise<FooterSection[]> {
    return await this.footerSectionService.listFooterSections();
  }

  @ResolveField(() => [ArticleFooterSection])
  async articleFooterSections(
    @Root() _footerSection: FooterSection,
  ): Promise<ArticleFooterSection[]> {
    return await this.articleFooerSectionService.findMany(_footerSection.id);
  }
}
