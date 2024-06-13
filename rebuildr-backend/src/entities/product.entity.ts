import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  title: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  categoryId: string;

  @ManyToOne(() => Category, (cat) => cat.id)
  category: Category;

  @ManyToOne(() => User, (user) => user.id)
  user: User;
}
