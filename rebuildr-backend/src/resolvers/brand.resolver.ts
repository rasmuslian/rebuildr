import { Args, Query, Resolver } from '@nestjs/graphql';
import { Brand } from 'src/entities/brand.entity';
import { BrandService } from 'src/services/brand.service';

@Resolver()
export class BrandResolver {
  constructor(private brandService: BrandService) {}

  @Query(() => Brand)
  async brand(@Args('id') id: string) {
    return this.brandService.getBrand(id);
  }

  @Query(() => [Brand])
  async brands() {
    return this.brandService.brands();
  }
}
