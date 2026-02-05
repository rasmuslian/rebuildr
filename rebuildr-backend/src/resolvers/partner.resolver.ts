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

@InputType()
export class CmsUpdatePartnerInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => FileInputType, { nullable: true })
  logo?: FileInputType;

  @Field({ nullable: true })
  websiteUrl?: string;
}
@InputType()
export class CmsDeletePartnerInput {
  @Field()
  id: string;
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

  @Mutation(() => CmsCreatePartnerResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsUpdatePartner(@Args('input') input: CmsUpdatePartnerInput) {
    return this.partnerService.updatePartner(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async cmsDeletePartner(@Args('input') input: CmsDeletePartnerInput) {
    return this.partnerService.deletePartner(input);
  }

  @ResolveField(() => File)
  async logo(
    @Parent() partner: Partner,
    @Context('partnerLoaders') partnerLoaders: IPartnerLoaders,
  ) {
    return partnerLoaders.logoLoader.load(partner.id);
  }
}
