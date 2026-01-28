import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';

enum BrandTypeEnum {
  OTHER = 'OTHER',
  REGULAR = 'REGULAR',
}
registerEnumType(BrandTypeEnum, { name: 'BrandTypeEnum' });

@Entity()
@ObjectType()
export class Brand extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Field()
  name: string;

  @Column({ unique: true })
  @Field()
  slug: string;

  @Column('enum', { enum: BrandTypeEnum, default: BrandTypeEnum.REGULAR })
  @Field(() => BrandTypeEnum)
  type: BrandTypeEnum;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToMany(() => Category, (category) => category.brands, {
    onDelete: 'CASCADE',
  })
  categories: Category[];
}
