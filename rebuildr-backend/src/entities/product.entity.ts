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
import { QuantityUnitEnum, quantityUnitEnumName } from './enums';
import { Brand } from './brand.entity';
import { Message } from './message.entity';

export enum ProductConditionEnum {
  NEW = 'NEW',
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  OKAY = 'OKAY',
  BAD = 'BAD',
}
registerEnumType(ProductConditionEnum, { name: 'ProductConditionEnum' });

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

@Entity()
@ObjectType()
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  title: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string;

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

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  hiddenReason?: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isGiveaway: boolean;

  @Column()
  primaryQuantity: number;
  @Column({
    type: 'enum',
    enum: QuantityUnitEnum,
    enumName: quantityUnitEnumName,
  })
  primaryUnit: QuantityUnitEnum;

  @Column({ nullable: true })
  secondaryQuantity?: number;
  @Column({
    type: 'enum',
    enum: QuantityUnitEnum,
    enumName: quantityUnitEnumName,
    nullable: true,
  })
  secondaryUnit?: QuantityUnitEnum;

  @Field({
    nullable: true,
    description: 'Unit: millimeter',
  })
  @Column({ nullable: true })
  height?: number;

  @Field({
    nullable: true,
    description: 'Unit: millimeter',
  })
  @Column({ nullable: true })
  width?: number;

  @Field({
    nullable: true,
    description: 'Unit: millimeter',
  })
  @Column({ nullable: true })
  length?: number;

  @Field({
    nullable: true,
    description: 'Unit: millimeter',
  })
  @Column({ nullable: true })
  thickness?: number;

  @Field({
    nullable: true,
    description: 'Unit: millimeter',
  })
  @Column({ nullable: true })
  diameter?: number;

  @Field({
    nullable: true,
    description: 'Unit: kg',
  })
  @Column({ nullable: true })
  weight?: number;

  @Field(() => ProductConditionEnum)
  @Column('enum', { enum: ProductConditionEnum })
  condition: ProductConditionEnum;

  @Field(() => ProductStatus)
  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @ManyToOne(() => Brand, (brand) => brand.id, { nullable: true })
  brand?: Brand;

  @OneToMany(() => File, (file) => file.productImage)
  images: File[];

  @OneToMany(() => File, (file) => file.productDocument)
  documents: File[];

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

  @OneToMany(() => Message, (message) => message.product)
  messages: Message[];
}
