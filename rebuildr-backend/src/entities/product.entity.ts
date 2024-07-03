import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  Point,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { User } from './user.entity';
import { File } from './file.entity';

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

  @ManyToOne(() => Category, (cat) => cat.id, { nullable: false })
  category: Category;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  user: User;

  @Field(() => Int)
  @Column()
  price: number;

  @Field(() => String)
  @Column()
  address: string;

  @Column('geometry')
  addressLocation: Point;

  @OneToMany(() => File, (file) => file.product, { nullable: true })
  images: File[];
}
