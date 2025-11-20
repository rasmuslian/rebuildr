import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
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
import { ReportProduct } from './report-product.entity';
import { MapPin } from './map-pin.entity';

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
  DELETED = 'DELETED',
}
registerEnumType(ProductStatus, { name: 'ProductStatusEnum' });

export enum MeasurementUnitEnum {
  M = 'M',
  DM = 'DM',
  CM = 'CM',
  MM = 'MM',
  KG = 'KG',
}
registerEnumType(MeasurementUnitEnum, { name: 'MeasurementUnitEnum' });

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

  @Column({
    type: 'tsvector',
    nullable: true,
    select: false,
    generatedType: 'STORED',
    asExpression: `setweight(to_tsvector('swedish', coalesce(title, '')), 'A') || setweight(to_tsvector('swedish', coalesce(description, '')), 'B')`,
  })
  textSearch: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date | null;

  @Column({ nullable: true })
  categoryId?: string;

  @ManyToOne(() => Category, (cat) => cat.id, { nullable: true })
  category?: Category;

  @Field()
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
  })
  @Column({ nullable: true })
  height?: number;
  @Field(() => MeasurementUnitEnum)
  @Column({
    type: 'enum',
    enum: MeasurementUnitEnum,
    enumName: 'measurement_unit_enum',
    default: MeasurementUnitEnum.MM,
  })
  heightUnit: MeasurementUnitEnum;

  @Field({
    nullable: true,
  })
  @Column({ nullable: true })
  width?: number;
  @Field(() => MeasurementUnitEnum)
  @Column({
    type: 'enum',
    enum: MeasurementUnitEnum,
    enumName: 'measurement_unit_enum',
    default: MeasurementUnitEnum.MM,
  })
  widthUnit: MeasurementUnitEnum;

  @Field({
    nullable: true,
  })
  @Column({ nullable: true })
  length?: number;
  @Field(() => MeasurementUnitEnum)
  @Column({
    type: 'enum',
    enum: MeasurementUnitEnum,
    enumName: 'measurement_unit_enum',
    default: MeasurementUnitEnum.MM,
  })
  lengthUnit: MeasurementUnitEnum;

  @Field({
    nullable: true,
  })
  @Column({ nullable: true })
  thickness?: number;
  @Field(() => MeasurementUnitEnum)
  @Column({
    type: 'enum',
    enum: MeasurementUnitEnum,
    enumName: 'measurement_unit_enum',
    default: MeasurementUnitEnum.MM,
  })
  thicknessUnit: MeasurementUnitEnum;

  @Field({
    nullable: true,
  })
  @Column({ nullable: true })
  diameter?: number;
  @Field(() => MeasurementUnitEnum)
  @Column({
    type: 'enum',
    enum: MeasurementUnitEnum,
    enumName: 'measurement_unit_enum',
    default: MeasurementUnitEnum.MM,
  })
  diameterUnit: MeasurementUnitEnum;

  @Field({
    nullable: true,
  })
  @Column({ nullable: true })
  weight?: number;
  @Field(() => MeasurementUnitEnum)
  @Column({
    type: 'enum',
    enum: MeasurementUnitEnum,
    enumName: 'measurement_unit_enum',
    default: MeasurementUnitEnum.KG,
  })
  weightUnit: MeasurementUnitEnum;

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

  @Field({ nullable: true })
  @Column({
    nullable: true,
    comment:
      "null, no choice regarding connection to project has been made\
      true, user has deliberately made the choice not to connect to project\
      false, this means a connection is done to a project, but is irrelevant because of 'project' column",
  })
  noProject?: boolean;

  @Column({ nullable: true })
  projectId?: string;
  @ManyToOne(() => Project, (p) => p.products, { nullable: true })
  project?: Project;

  @ManyToMany(() => ShippingPrice, (sp) => sp.products)
  @JoinTable()
  shippingPrices: ShippingPrice[];

  @OneToMany(() => ReportProduct, (rp) => rp.product)
  reportProducts: ReportProduct[];

  @OneToOne(() => MapPin, mapPin => mapPin.product, { nullable: true, cascade: true })
  mapPin?: MapPin;
}
