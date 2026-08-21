import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Float,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { AuthedUserType } from 'src/auth/constants';
import { RolesGuard } from 'src/auth/roles.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { CmsAdImportBatch } from 'src/entities/cms-ad-import-batch.entity';
import { Product } from 'src/entities/product.entity';
import { UserRoleEnum } from 'src/entities/user.entity';
import { FileInputType } from 'src/resolvers/file.resolver';

import { CmsAdImportService } from 'src/services/cms-ad-import.service';

@InputType()
class CmsAdImportDeliveryDefaultsInput {
  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  pickupEnabled?: boolean;

  @Field({ nullable: true })
  deliveryEnabled?: boolean;

  @Field(() => Float, { nullable: true })
  deliveryRadius?: number;

  @Field(() => Float, { nullable: true })
  deliveryPrice?: number;

  @Field({ nullable: true })
  shippingPriceId?: string;
}

@InputType()
class CreateCmsAdImportBatchInput {
  @Field()
  sellerId: string;

  @Field(() => [FileInputType])
  files: FileInputType[];

  @Field(() => CmsAdImportDeliveryDefaultsInput, { nullable: true })
  deliveryDefaults?: CmsAdImportDeliveryDefaultsInput;
}

@ObjectType()
class CreateCmsAdImportBatchResponse {
  @Field(() => CmsAdImportBatch)
  batch: CmsAdImportBatch;

  @Field(() => [String])
  uploadUrls: string[];
}

@Resolver(() => CmsAdImportBatch)
export class CmsAdImportResolver {
  constructor(private readonly cmsAdImportService: CmsAdImportService) {}

  @Mutation(() => CreateCmsAdImportBatchResponse)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  createCmsAdImportBatch(
    @CurrentUser() user: AuthedUserType,
    @Args('input') input: CreateCmsAdImportBatchInput,
  ) {
    return this.cmsAdImportService.createBatch(user.id, input);
  }

  @Mutation(() => CmsAdImportBatch)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  startCmsAdImportBatch(@Args('batchId') batchId: string) {
    return this.cmsAdImportService.startBatch(batchId);
  }

  @Query(() => CmsAdImportBatch)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  cmsAdImportBatch(@Args('batchId') batchId: string) {
    return this.cmsAdImportService.getBatch(batchId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  removeCmsAdImportBatch(@Args('batchId') batchId: string) {
    return this.cmsAdImportService.removeBatch(batchId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  removeCmsImportedAdDraft(
    @Args('batchId') batchId: string,
    @Args('productId') productId: string,
  ) {
    return this.cmsAdImportService.removeDraft(batchId, productId);
  }

  @Mutation(() => [Product])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  publishCmsImportedAds(
    @Args('batchId') batchId: string,
    @Args('productIds', { type: () => [String] }) productIds: string[],
  ) {
    return this.cmsAdImportService.publish(batchId, productIds);
  }
}
