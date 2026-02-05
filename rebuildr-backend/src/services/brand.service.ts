import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from 'src/entities/brand.entity';
import { BadFieldsInputException, BadUserInputException } from 'src/exceptions';
import { FindOptionsWhere, ILike, Like, Repository } from 'typeorm';
import {
  ListBrandsInput,
  ListBrandsResponse,
  CmsCreateBrandInput,
  CmsUpdateBrandInput,
  CreateBrandByUserInput,
  BrandsInput,
} from 'src/resolvers/brand.resolver';
import slugify from 'slugify';
import { NotFoundException } from 'src/exceptions';
import { Product } from 'src/entities/product.entity';
import { Category } from 'src/entities/category.entity';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand) private brandRepository: Repository<Brand>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getBrand(id: string) {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) {
      throw BadUserInputException();
    }
    return brand;
  }

  async brands(input?: BrandsInput) {
    let where: FindOptionsWhere<Brand>;
    if (input?.name) {
      const slug = this.createSlugFromName(input.name);
      where = { ...where, slug: Like(`%${slug}%`) };
    }
    return await this.brandRepository.find({ order: { name: 'ASC' }, where });
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

  async createBrandByUser(
    input: CreateBrandByUserInput,
    currentUserId: string,
  ): Promise<Brand> {
    const slug = this.createSlugFromName(input.name);

    let brand = new Brand();
    const brandWithSameSlug = await this.brandRepository.findOne({
      where: { slug },
    });
    if (brandWithSameSlug) {
      this.logger.error('Brand with same slug already exists', {
        newBrandName: input.name,
        slug,
        brandWithSameSlug,
        currentUserId,
      });
      throw BadFieldsInputException([
        {
          message: 'Det finns redan ett varumärke med det här namnet.',
          name: 'brand',
          type: 'BAD_VALUE',
        },
      ]);
    }

    Object.assign<Brand, Partial<Brand>>(brand, {
      name: input.name,
      slug: slug,
      createdById: currentUserId,
    });
    brand = await this.brandRepository.save(brand);

    if (input.categoryId) {
      try {
        await this.brandRepository
          .createQueryBuilder()
          .relation(Category, 'c')
          .of(brand)
          .add(input.categoryId);
      } catch (e) {
        this.logger.error(
          'createBrandByUser: Could not connect brand and category',
          {
            brand,
            categoryId: input.categoryId,
            currentUserId,
            e,
          },
        );
      }
    }
    return brand;
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
    const slug = this.createSlugFromName(input.name);

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
      const slug = this.createSlugFromName(input.name);

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

  private createSlugFromName(name: string) {
    return slugify(name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
}
