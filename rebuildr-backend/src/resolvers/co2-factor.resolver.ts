import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { CO2Factor } from 'src/entities/co2-factor.entity';
import { UserRoleEnum } from 'src/entities/user.entity';
import { CO2FactorService } from 'src/services/co2-factor.service';

@InputType()
export class CmsUpdateCO2Factor {
  @Field()
  id: string;

  //TODO: remove this when C1-C3 is supported by Boverket. We should then not be able to edit this
  @Field({ nullable: true })
  disposalCoefficient?: number;
}

@Resolver(() => CO2Factor)
export class CO2FactorResolver {
  constructor(private co2FactorService: CO2FactorService) {}

  @Query(() => [CO2Factor])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async co2Factors() {
    return this.co2FactorService.getCO2Factors();
  }
  @Mutation(() => CO2Factor)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  cmsUpdateCO2Factor(@Args('input') input: CmsUpdateCO2Factor) {
    return this.co2FactorService.cmsUpdateCO2Factor(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async syncCO2Factors() {
    try {
      await this.co2FactorService.syncCO2Data();
      return true;
    } catch {
      return false;
    }
  }
}
