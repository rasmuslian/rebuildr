import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryTree } from 'src/entities/category-tree.entity';
import { Category } from 'src/entities/category.entity';
import { Event, EventType } from 'src/entities/event.entity';
import { NotFoundException, BadUserInputException } from 'src/exceptions';
import {
  GetCategoriesInput,
  CategoriesInput,
  RootCategoriesInput,
  CmsUpdateCategoryInput,
  CmsUpdateCategoryResponse,
} from 'src/resolvers/category.resolver';
import { Equal, IsNull, Repository } from 'typeorm';
import { FileService } from './file.service';

@Injectable()
export class CategoryService {
  constructor(
    private fileService: FileService,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(CategoryTree)
    private categoryTreeRepository: Repository<CategoryTree>,
  ) {}

  async findOne(id: string) {
    return await this.categoryRepository.findOneBy({ id: Equal(id) });
  }

  async findAll(input: CategoriesInput) {
    if (input.seasonalCategories) {
      return await this.categoryRepository.find({
        where: {
          inSeason: true,
        },
      });
    }

    return await this.categoryRepository.find();
  }

  async findAllRoot(input: RootCategoriesInput) {
    return await this.categoryRepository.find({
      where: {
        parentId: IsNull(),
      },
      order: { orderIndex: input?.orderBy ?? 'DESC' },
    });
  }

  async findCategories(input: GetCategoriesInput) {
    const queryBuilder = this.categoryRepository.createQueryBuilder();
    if (input.parentIds?.length === 0) {
      return [];
    }
    if (input.parentIds) {
      queryBuilder.where('"parentId" IN (:...parentIds)', {
        parentIds: input.parentIds,
      });
    }
    return await queryBuilder.getMany();
  }

  async getAncestorIds(category: Category) {
    const treeNode = await this.categoryTreeRepository.findOne({
      where: { id: category.id },
    });
    return treeNode.ancestorIds;
  }

  async hasChildren(categeory: Category) {
    const child = await this.categoryRepository.findOne({
      where: { parentId: categeory.id },
    });
    return !!child;
  }

  async findPopular(_limit?: number) {
    //Limit defaults to 6 and may not exceed 30
    const limit = _limit ?? 6;
    return await this.categoryRepository
      .createQueryBuilder('c')
      .where((qb) => {
        //Finds id's of all categories
        const categoryIds = qb
          .subQuery()
          .select('value')
          .from((qb) => {
            //Finds all events that has to do with categories.
            //Group them by value (aka categoryId), count them and order by count
            //to get most popular first
            return qb
              .subQuery()
              .select('count(*), e.value::uuid')
              .from(Event, 'e')
              .where('type = :eventType', {
                eventType: EventType.CATEGORY_VISIT,
              })
              .groupBy('value')
              .orderBy('count', 'DESC')
              .limit(limit > 30 ? 30 : limit);
          }, 'ordered_events')
          .getQuery();

        return 'c.id IN ' + categoryIds;
      })
      .getMany();
  }

  async findChildren(parentId: string) {
    return await this.categoryRepository.findBy({ parentId });
  }

  async updateCategory(
    input: CmsUpdateCategoryInput,
  ): Promise<CmsUpdateCategoryResponse> {
    const category = await this.categoryRepository.findOneBy({
      id: input.id,
    });

    if (!category) {
      throw NotFoundException(`Category not found`);
    }

    try {
      Object.assign(category, {
        inSeason: input.inSeason,
        inSelection: input.inSelection,
        description: input.description,
      });

      if (input.image) {
        if (category.image) {
          await this.fileService.deleteFiles([category.image]);
        }

        category.image = await this.fileService.createFile(input.image);
      }

      await this.categoryRepository.save(category);
      const imagePutUrl = category.image
        ? await this.fileService.uploadFile(category.image, true)
        : null;

      return { category, imagePutUrl };
    } catch (error) {
      throw BadUserInputException('Failed to update category: ' + error);
    }
  }
}
