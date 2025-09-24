import { Query, Resolver } from '@nestjs/graphql';
import { Brand } from 'src/entities/brand.entity';
import { BrandService } from 'src/services/brand.service';

@Resolver()
export class BrandResolver {
  constructor(private brandService: BrandService) {}

  @Query(() => [Brand])
  async brands() {
    return this.brandService.brands();
  }
}
