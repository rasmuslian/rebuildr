import { Injectable } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { Brand } from 'src/entities/brand.entity';
import { BrandService } from 'src/services/brand.service';

@Resolver()
@Injectable()
export class BrandResolver {
  constructor(private brandService: BrandService) {}

  @Query(() => [Brand])
  async brands() {
    return this.brandService.brands();
  }
}
