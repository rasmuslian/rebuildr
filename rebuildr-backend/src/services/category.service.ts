import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CaslAbilityFactory } from 'src/casl/caslAbility.factory';
import { Category } from 'src/entities/category.entity';
import { User } from 'src/entities/user.entity';
import { BadUserInputException } from 'src/exceptions';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private caslAbilityFactory: CaslAbilityFactory,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOne(id: string) {
    return await this.categoryRepository.findOneBy({ id });
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findAllRoot() {
    return await this.categoryRepository.findBy({
      parentId: IsNull(),
    });
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
