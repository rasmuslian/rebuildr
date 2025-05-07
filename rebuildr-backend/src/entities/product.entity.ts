import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
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
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { User } from './user.entity';
import { File } from './file.entity';
import { Purchase } from './purchase.entity';
import { QuantityUnitEnum, quantityUnitEnumName } from './enums';
import { Brand } from './brand.entity';
import { Message } from './message.entity';
import { Project } from './project.entity';
import { ShippingPrice } from './shipping-price.entity';

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
  SOLD = 'SOLD',
}
registerEnumType(ProductStatus, { name: 'ProductStatusEnum' });

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

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  categoryId?: string;

  @ManyToOne(() => Category, (cat) => cat.id, { nullable: true })
  category?: Category;

  @Column()
  sellerId: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  seller: User;

  @Column()
  price: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  addressLocation?: Point;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  hiddenReason?: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isGiveaway: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  primaryQuantity?: number;
  @Field(() => QuantityUnitEnum, { nullable: true })
  @Column({
    type: 'enum',
    enum: QuantityUnitEnum,
    enumName: quantityUnitEnumName,
    nullable: true,
  })
  primaryUnit?: QuantityUnitEnum;

  @Field({ nullable: true })
  @Column({ nullable: true })
  secondaryQuantity?: number;
  @Field(() => QuantityUnitEnum, { nullable: true })
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
  @Column('enum', {
    enum: ProductConditionEnum,
    default: ProductConditionEnum.GOOD,
  })
  condition: ProductConditionEnum;

  @Field(() => ProductStatus)
  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Column({ nullable: true })
  brandId?: string;
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

  @Field()
  @Column({ default: false })
  pickupEnabled: boolean;

  @Field()
  @Column({ default: false })
  deliveryEnabled: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveryRadius?: number;

  @Column({ nullable: true })
  deliveryPrice?: number;

  @OneToMany(() => Purchase, (p) => p.product)
  purchases: Purchase[];

  @OneToMany(() => Message, (message) => message.product)
  messages: Message[];

  @Column({ nullable: true })
  projectId?: string;
  @ManyToOne(() => Project, (p) => p.products, { nullable: true })
  project?: Project;

  @ManyToMany(() => ShippingPrice, (sp) => sp.products)
  @JoinTable()
  shippingPrices: ShippingPrice[];
}
