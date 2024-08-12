import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CaslAbilityFactory } from 'src/casl/caslAbility.factory';
import { Category } from 'src/entities/category.entity';
import { User } from 'src/entities/user.entity';
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

  async update(
    input: { id: string; inSelection?: boolean; inSeason?: boolean },
    userId: string,
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });
    const category = await this.categoryRepository.findOneBy({ id: input.id });
    if (!user || !category) {
      throw new BadRequestException();
    }
    const ability = this.caslAbilityFactory.createForUser(user);
    if (!ability.can('update', Category)) {
      throw new ForbiddenException();
    }

    category.inSelection = input.inSelection ?? category.inSelection;
    category.inSeason = input.inSeason ?? category.inSeason;

    return await this.categoryRepository.save(category);
  }
}
