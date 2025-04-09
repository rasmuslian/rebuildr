import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';

@Entity()
@ObjectType()
export class File {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mimeType: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Product, (product) => product.images, { nullable: true })
  productImage?: Product;

  @ManyToOne(() => Product, (product) => product.documents, { nullable: true })
  productDocument?: Product;

  @OneToOne(() => Category, (category) => category.image, { nullable: true })
  category?: Category;
}
