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
import { Partner } from 'src/entities/partner.entity';
import { PartnerService } from 'src/services/partner.service';
import { File } from 'src/entities/file.entity';
import { IPartnerLoaders } from 'src/dataloaders/partner.loader';
import { FileInputType } from './file.resolver';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRoleEnum } from 'src/entities/user.entity';
import { Roles } from 'src/decorators/roles.decorator';

@InputType()
export class CmsCreatePartnerInput {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => FileInputType)
  logo: FileInputType;

  @Field({ nullable: true })
  websiteUrl?: string;
}

@ObjectType()
export class CmsCreatePartnerResponse {
  @Field(() => Partner)
  partner: Partner;

  @Field(() => String, { nullable: true })
  imagePutUrl?: string;
}

@Resolver(() => Partner)
export class PartnerResolver {
  constructor(private partnerService: PartnerService) {}

  @Query(() => [Partner])
  async partners() {
    return this.partnerService.partners();
  }

  @Mutation(() => CmsCreatePartnerResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsCreatePartner(@Args('input') input: CmsCreatePartnerInput) {
    return this.partnerService.createPartner(input);
  }

  @ResolveField(() => File)
  async logo(
    @Parent() partner: Partner,
    @Context('partnerLoaders') partnerLoaders: IPartnerLoaders,
  ) {
    return partnerLoaders.logoLoader.load(partner.id);
  }
}
