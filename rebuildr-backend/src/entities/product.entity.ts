import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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
import { QuantityUnitEnum, quantityUnitEnumName } from '../constants/enums';
import { Brand } from './brand.entity';
import { Project } from './project.entity';
import { ShippingPrice } from './shipping-price.entity';
import { ReportProduct } from './report-product.entity';
import { MapPin } from './map-pin.entity';
import { Conversation } from './conversation.entity';

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

/**
 * Where a listing is shown. PUBLIC = the open marketplace (default, as today).
 * INTERNAL = only the owning company's internal inventory ("internlager") —
 * excluded from all public marketplace queries.
 */
export enum ProductVisibilityEnum {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
}
registerEnumType(ProductVisibilityEnum, { name: 'ProductVisibilityEnum' });

export enum ColorTypeEnum {
  NCS = 'NCS',
  FREE_TEXT = 'FREE_TEXT',
}
registerEnumType(ColorTypeEnum, { name: 'ColorTypeEnum' });

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

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  additionalInfo?: string;

  @Column({
    type: 'tsvector',
    nullable: true,
    select: false,
    insert: false,
    update: false,
    generatedType: 'STORED',
    asExpression: `setweight(to_tsvector('swedish', coalesce(title, '')), 'A') || setweight(to_tsvector('swedish', coalesce(description, '')), 'B')`,
  })
  textSearch?: string;

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

  /**
   * AI-suggested price range (SEK) from image analysis. Suggestion only —
   * never auto-applied to price; the seller always sets price explicitly.
   */
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, type: 'int' })
  priceSuggestionMin?: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, type: 'int' })
  priceSuggestionMax?: number | null;

  @Field(() => Boolean)
  @Column({ default: false })
  soldByQuantity: boolean;

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

  @Field({ nullable: true })
  @Column({ nullable: true })
  color?: string;

  @Field(() => ColorTypeEnum)
  @Column('enum', { enum: ColorTypeEnum, default: ColorTypeEnum.NCS })
  colorType: ColorTypeEnum;

  @Field(() => ProductConditionEnum)
  @Column('enum', {
    enum: ProductConditionEnum,
    default: ProductConditionEnum.GOOD,
  })
  condition: ProductConditionEnum;

  @Field(() => ProductStatus)
  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Field(() => ProductVisibilityEnum)
  @Column({
    type: 'enum',
    enum: ProductVisibilityEnum,
    enumName: 'product_visibility_enum',
    default: ProductVisibilityEnum.PUBLIC,
  })
  visibility: ProductVisibilityEnum;

  /**
   * The organization that owns this listing. Set when published as INTERNAL so
   * all members of the company share the same internal inventory. Stored as a
   * plain FK column (no ORM relation) to avoid an entity import cycle.
   */
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  organizationId?: string | null;

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

  @OneToMany(() => Conversation, (conversation) => conversation.product)
  conversations: Conversation[];

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

  @Column({ nullable: true })
  mapPinId?: string;

  @OneToOne(() => MapPin, (mapPin) => mapPin.product, {
    nullable: true,
    cascade: true,
    orphanedRowAction: 'delete',
  })
  @JoinColumn()
  mapPin?: MapPin;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'float' })
  co2SavingBuyer?: number;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'float' })
  co2SavingSeller?: number;

  @Column({ nullable: true })
  publishedAt?: Date;

  //--------------Life cycle logic----------------
  private _previousStatus?: ProductStatus;

  @AfterLoad()
  onLoad() {
    this._previousStatus = this.status;
  }

  @BeforeInsert()
  onInsert() {
    if (this.status === ProductStatus.PUBLISHED) {
      this.publishedAt = new Date();
    }
  }

  @BeforeUpdate()
  onPublish() {
    if (
      this.status === ProductStatus.PUBLISHED &&
      this._previousStatus !== ProductStatus.PUBLISHED
    ) {
      this.publishedAt = new Date();
    }
  }
}
