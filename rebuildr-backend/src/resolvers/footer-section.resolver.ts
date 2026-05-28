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
  Context,
} from '@nestjs/graphql';
import { FooterSection } from 'src/entities/footer-section.entity';
import { FooterSectionService } from 'src/services/footer-section.service';
import {
  FooterSectionEntry,
  FooterSectionEntryType,
} from 'src/entities/footer-section-entry.entity';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/entities/user.entity';
import { IFooterSectionLoaders } from 'src/dataloaders/footer-section.loader';

@InputType()
export class FooterEntryInput {
  @Field(() => FooterSectionEntryType)
  type: FooterSectionEntryType;

  @Field(() => Int)
  orderIndex: number;

  @Field({ nullable: true })
  articleId?: string;

  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  url?: string;
}

@InputType()
export class CmsCreateFooterSectionInput {
  @Field()
  title: string;

  @Field()
  orderIndex: number;

  @Field(() => [FooterEntryInput])
  entries: FooterEntryInput[];
}

@InputType()
export class CmsUpdateFooterSectionInput {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  orderIndex: number;

  @Field(() => [FooterEntryInput])
  entries: FooterEntryInput[];
}

@Resolver(() => FooterSection)
export class FooterSectionResolver {
  constructor(private footerSectionService: FooterSectionService) {}

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
  ): Promise<boolean> {
    return this.footerSectionService.deleteFooterSection(footerSectionId);
  }

  @Query(() => [FooterSection])
  async listFooterSection(): Promise<FooterSection[]> {
    return await this.footerSectionService.listFooterSections();
  }

  @ResolveField(() => [FooterSectionEntry])
  async entries(
    @Root() _footerSection: FooterSection,
    @Context('footerSectionLoaders')
    footerSectionLoaders: IFooterSectionLoaders,
  ): Promise<FooterSectionEntry[]> {
    return await footerSectionLoaders.entriesLoader.load(_footerSection.id);
  }
}
