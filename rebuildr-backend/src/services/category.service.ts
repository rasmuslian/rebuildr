import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryTree } from 'src/entities/category-tree.entity';
import { Category } from 'src/entities/category.entity';
import { Event, EventType } from 'src/entities/event.entity';
import { BadUserInputException } from 'src/exceptions';
import { GetCategoriesInput } from 'src/resolvers/category.resolver';
import { Equal, IsNull, Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(CategoryTree)
    private categoryTreeRepository: Repository<CategoryTree>,
  ) {}

  async findOne(id: string) {
    return await this.categoryRepository.findOneBy({ id: Equal(id) });
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findAllRoot() {
    return await this.categoryRepository.findBy({
      parentId: IsNull(),
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
    return !child;
  }

  async findPopular(_limit?: number) {
    //Limit defaults to 15 and may not exceed 30
    const limit = _limit ?? 15;
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

  async update(input: {
    id: string;
    inSelection?: boolean;
    inSeason?: boolean;
  }) {
    const category = await this.categoryRepository.findOneBy({ id: input.id });
    if (!category) {
      throw BadUserInputException(
        'Failed to update categeory due to bad input',
      );
    }

    category.inSelection = input.inSelection ?? category.inSelection;
    category.inSeason = input.inSeason ?? category.inSeason;

    return await this.categoryRepository.save(category);
  }
}
