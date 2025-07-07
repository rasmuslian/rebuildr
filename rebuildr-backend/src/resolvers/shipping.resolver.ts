import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { swedishPostCodeRegex } from 'src/constants/regexp';
import { ShippingProviderEnum } from 'src/entities/shipping-price.entity';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { ShippingService } from 'src/services/shipping.service';
import { Logger } from 'winston';
import { z } from 'zod';

const nearbyServicePointsSchema = z.object({
  postalCode: z.string().regex(swedishPostCodeRegex),
  amount: z.number().max(10).min(1).optional(),
  shippingProvider: z.nativeEnum(ShippingProviderEnum),
  address: z.string().optional(),
});
@InputType()
export class NearbyServicePointsInput {
  @Field()
  postalCode: string;
  @Field({ nullable: true })
  amount?: number;
  @Field(() => ShippingProviderEnum)
  shippingProvider: ShippingProviderEnum;
}

@ObjectType()
export class ServicePointResponse {
  @Field()
  id: string;
  @Field()
  name: string;
  @Field()
  distance: number;
  @Field()
  streetName: string;
  @Field()
  streetNumber: string;
  @Field()
  postalCode: string;
  @Field()
  city: string;
}

@ObjectType()
export class BookShippingResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  qrCodeUrl?: string;

  @Field()
  qrCodeContent: string;
}
@Resolver()
export class ShippingResolver {
  constructor(
    private shippingService: ShippingService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Query(() => [ServicePointResponse])
  @UseGuards(GqlAuthGuard)
  async nearbyServicePoints(
    @Args('input', new ZodValidationPipe(nearbyServicePointsSchema))
    input: NearbyServicePointsInput,
  ) {
    return await this.shippingService.findNearbyServicePoints(
      input.postalCode,
      input.shippingProvider,
      input.amount,
    );
  }
}
