import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { File } from 'src/entities/file.entity';
import { BadUserInputException } from 'src/exceptions';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
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

  //TODO: What is a popular category? Find out and implement that instead of below functionality
  async findPopular(limit?: number) {
    return await this.categoryRepository.find({
      where: { parentId: Not(IsNull()) },
      take: limit,
      order: { name: 'ASC' },
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

  async findIcon(category: Category) {
    return this.fileRepository.findOne({ where: { category: category } });
  }
}
