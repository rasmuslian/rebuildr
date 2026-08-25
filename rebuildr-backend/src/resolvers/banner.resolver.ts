import {
  Args,
  Context,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  Banner,
  BannerActionEnum,
  BannerPlacementEnum,
  BannerPresetBackground,
} from 'src/entities/banner.entity';
import { BannerService } from 'src/services/banner.service';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRoleEnum } from 'src/entities/user.entity';
import { FileInputType } from './file.resolver';
import { File } from 'src/entities/file.entity';
import { IBannerLoaders } from 'src/dataloaders/banner.loader';

@InputType()
export class CmsCreateBannerInput {
  @Field({ nullable: true })
  label?: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  url?: string;

  @Field(() => BannerActionEnum, { nullable: true })
  action?: BannerActionEnum;

  @Field(() => BannerPresetBackground, { nullable: true })
  presetBackground?: BannerPresetBackground;

  @Field(() => FileInputType, { nullable: true })
  backgroundImage?: FileInputType;

  @Field(() => FileInputType, { nullable: true })
  logo?: FileInputType;

  @Field(() => [BannerPlacementEnum])
  placements: BannerPlacementEnum[];

  @Field({ nullable: true })
  ctaText?: string;

  @Field(() => Date)
  showFrom: Date;

  @Field(() => Date, { nullable: true })
  showTo?: Date;
}

@InputType()
export class CmsUpdateBannerInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  label?: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  url?: string;

  @Field(() => BannerActionEnum, { nullable: true })
  action?: BannerActionEnum;

  @Field(() => BannerPresetBackground, { nullable: true })
  presetBackground?: BannerPresetBackground;

  @Field(() => FileInputType, { nullable: true })
  backgroundImage?: FileInputType;

  @Field(() => FileInputType, { nullable: true })
  logo?: FileInputType;

  @Field(() => [BannerPlacementEnum])
  placements: BannerPlacementEnum[];

  @Field({ nullable: true })
  ctaText?: string;

  @Field(() => Date)
  showFrom: Date;

  @Field(() => Date, { nullable: true })
  showTo?: Date;
}

@ObjectType()
export class CmsCreateBannerResponse {
  @Field(() => Banner)
  banner: Banner;

  @Field(() => String, { nullable: true })
  imagePutUrl?: string;

  @Field(() => String, { nullable: true })
  logoPutUrl?: string;
}

@Resolver(() => Banner)
export class BannerResolver {
  constructor(private bannerService: BannerService) {}

  @Query(() => [Banner])
  async banners(
    @Args('placement', {
      type: () => BannerPlacementEnum,
      nullable: true,
    })
    placement?: BannerPlacementEnum,
  ) {
    return this.bannerService.getBanners(placement);
  }

  @Query(() => [Banner])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsListBanners(): Promise<Banner[]> {
    return this.bannerService.findAll();
  }

  @Query(() => Banner)
  async cmsBannerById(@Args('id') id: string): Promise<Banner> {
    return this.bannerService.findOne(id);
  }

  @Mutation(() => CmsCreateBannerResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsCreateBanner(
    @Args('input') input: CmsCreateBannerInput,
  ): Promise<CmsCreateBannerResponse> {
    return this.bannerService.createBanner(input);
  }

  @Mutation(() => CmsCreateBannerResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsUpdateBanner(
    @Args('input') input: CmsUpdateBannerInput,
  ): Promise<CmsCreateBannerResponse> {
    return this.bannerService.updateBanner(input);
  }

  @ResolveField(() => File, { nullable: true })
  async backgroundImage(
    @Parent() banner: Banner,
    @Context('bannerLoaders') bannerLoaders: IBannerLoaders,
  ) {
    return await bannerLoaders.backgroundImageLoader.load(banner.id);
  }

  @ResolveField(() => File, { nullable: true })
  async logo(
    @Parent() banner: Banner,
    @Context('bannerLoaders') bannerLoaders: IBannerLoaders,
  ) {
    return await bannerLoaders.logoLoader.load(banner.id);
  }
}
