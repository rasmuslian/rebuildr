import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  Point,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { User } from './user.entity';
import { File } from './file.entity';
import { Purchase } from './purchase.entity';

export enum ProductConditionEnum {
  NEW = 'NEW',
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  OKAY = 'OKAY',
  BAD = 'BAD',
}

registerEnumType(ProductConditionEnum, { name: 'ProductConditionEnum' });

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
  sellerId: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  seller: User;

  @Field(() => Int)
  @Column()
  price: number;

  @Field(() => String)
  @Column()
  address: string;

  @Column('geometry', { spatialFeatureType: 'Point', srid: 4326 })
  addressLocation: Point;

  @OneToMany(() => File, (file) => file.product, { nullable: true })
  images?: File[];

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  hiddenReason?: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isGiveaway: boolean;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  brand?: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  amount?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Unit: millimeter',
  })
  @Column({ nullable: true })
  height?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Unit: millimeter',
  })
  @Column({ nullable: true })
  width?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Unit: millimeter',
  })
  @Column({ nullable: true })
  depth?: number;

  @Field(() => Int, { nullable: true, description: 'Unit: liter' })
  @Column({ nullable: true })
  volume?: number;

  @Field(() => ProductConditionEnum)
  @Column('enum', { enum: ProductConditionEnum })
  condition: ProductConditionEnum;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => User, (user) => user.likedProducts)
  @JoinTable()
  likedBy: User[];

  /**
   * Field to be populated when product is fetched and a position is given as argument.
   */
  @Field({ nullable: true })
  distanceFromPosition?: number;

  @OneToMany(() => Purchase, (p) => p.product)
  purchases: Purchase[];
}
