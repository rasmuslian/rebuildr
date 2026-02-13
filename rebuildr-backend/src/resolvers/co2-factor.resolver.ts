import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { CO2Factor } from 'src/entities/co2-factor.entity';
import { UserRoleEnum } from 'src/entities/user.entity';
import { CO2FactorService } from 'src/services/co2-factor.service';

@Resolver(() => CO2Factor)
export class CO2FactorResolver {
  constructor(private co2FactorService: CO2FactorService) {}

  @Query(() => [CO2Factor])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles([UserRoleEnum.ADMIN])
  async co2Factors() {
    return this.co2FactorService.getCO2Factors();
  }
}
