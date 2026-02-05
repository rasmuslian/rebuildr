import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from 'src/entities/brand.entity';
import { BadFieldsInputException, BadUserInputException } from 'src/exceptions';
import { ILike, Repository } from 'typeorm';
import {
  ListBrandsInput,
  ListBrandsResponse,
  CmsCreateBrandInput,
  CmsUpdateBrandInput,
  CreateBrandInput,
} from 'src/resolvers/brand.resolver';
import slugify from 'slugify';
import { NotFoundException } from 'src/exceptions';
import { Product } from 'src/entities/product.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand) private brandRepository: Repository<Brand>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
  ) {}

  async getBrand(id: string) {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw BadUserInputException();
    }
    return brand;
  }

  async brands() {
    return await this.brandRepository.find({ order: { name: 'ASC' } });
  }

  async listBrands(input: ListBrandsInput): Promise<ListBrandsResponse> {
    const pageSize = Number(input.pageSize) || 10;
    const page = Number(input.page) || 0;
    const skip = Math.max(0, pageSize * page);
    const searchString = input.searchString || '';

    const [brands, total] = await this.brandRepository.findAndCount({
      where: [
        {
          name: ILike(`%${searchString}%`),
        },
      ],
      take: pageSize,
      skip,
      order: { createdAt: 'DESC' },
    });

    return { brands, total };
  }
  async canDeleteBrand(id: string) {
    const brands = await this.brandRepository
      .createQueryBuilder('b')
      .innerJoin('product', 'p', 'p."brandId" = b.id', { id })
      .where('b.id = :id', { id })
      .getMany();
    if (brands.length) {
      //there exists at least one product connected to this brand
      return false;
    }
    return true;
  }

  async cmsCreateBrand(input: CmsCreateBrandInput): Promise<Brand> {
    const slug = slugify(input.name, {
      lower: true,
      strict: true,
      trim: true,
    });

    try {
      const brand = new Brand();

      Object.assign<Brand, Partial<Brand>>(brand, {
        name: input.name,
        slug: slug,
      });

      return await this.brandRepository.save(brand);
    } catch {
      throw BadUserInputException(
        'Det finns redan ett varumärke med det här namnet.',
      );
    }
  }

  async cmsUpdateBrand(input: CmsUpdateBrandInput): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id: input.id },
    });

    if (!brand) {
      throw NotFoundException('Kunde inte hitta varumärket.');
    }

    try {
      const slug = slugify(input.name, {
        lower: true,
        strict: true,
        trim: true,
      });

      Object.assign<Brand, Partial<Brand>>(brand, {
        name: input.name,
        slug: slug,
      });

      return this.brandRepository.save(brand);
    } catch {
      throw BadUserInputException(
        'Det finns redan ett varumärke med det här namnet.',
      );
    }
  }

  async cmsDeleteBrand(id: string) {
    try {
      await this.brandRepository.delete(id);
      return true;
    } catch {
      throw BadUserInputException('Failed deleting brand');
    }
  }

  async cmsReassignBrand(fromId: string, toId: string) {
    const fromBrand = await this.brandRepository.findOneBy({ id: fromId });
    const toBrand = await this.brandRepository.findOneBy({ id: toId });

    if (!fromBrand || !toBrand) {
      throw BadUserInputException('Brands not found');
    }

    //Update necessary entities
    await this.productRepository.update({ brandId: fromId }, { brandId: toId });

    return {
      fromBrand,
      toBrand,
    };
  }
}
