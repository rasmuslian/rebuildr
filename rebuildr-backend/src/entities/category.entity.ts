import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { File } from './file.entity';
import {
  MeasurementTypeEnum,
  measurementTypeEnumName,
  QuantityUnitEnum,
  quantityUnitEnumName,
} from '../constants/enums';
import { Brand } from './brand.entity';
import { CO2Factor } from './co2-factor.entity';

export enum CategoryImageGenerationStatusEnum {
  PENDING = 'PENDING',
  GENERATED = 'GENERATED',
  FAILED = 'FAILED',
}
registerEnumType(CategoryImageGenerationStatusEnum, {
  name: 'CategoryImageGenerationStatusEnum',
});

export enum CategoryTypeEnum {
  STANDARD = 'STANDARD',
  GIVEAWAY = 'GIVEAWAY',
}
registerEnumType(CategoryTypeEnum, { name: 'CategoryTypeEnum' });

enum CategoryIconEnum {
  MATERIAL = 'MATERIAL',
  WOOD = 'WOOD',
  DOOR = 'DOOR',
  WINDOW = 'WINDOW',
  FLOOR = 'FLOOR',
  INTERIOR = 'INTERIOR',
  PAINT = 'PAINT',
  FASTENERS = 'FASTENERS',
  ROOF = 'ROOF',
  TILES = 'TILES',
  KITCHEN_BATHROOM = 'KITCHEN_BATHROOM',
  ELECTRICAL = 'ELECTRICAL',
  OUTDOORS = 'OUTDOORS',
  TOOLS = 'TOOLS',
  WORKPLACE = 'WORKPLACE',
}
registerEnumType(CategoryIconEnum, { name: 'CategoryIconEnum' });

@Entity()
@ObjectType()
export class Category {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field(() => CategoryTypeEnum)
  @Column({
    type: 'enum',
    enum: CategoryTypeEnum,
    enumName: 'category_type_enum',
    default: CategoryTypeEnum.STANDARD,
  })
  categoryType: CategoryTypeEnum;

  @Field(() => [String])
  @Column('text', { array: true, default: [] })
  searchAliases: string[];

  /**
   * The order index of the category.
   * Used to sort the categories in the frontend.
   * The lowest value comes first.
   */
  @Field(() => Int, { defaultValue: 0 })
  @Column({ default: 0 })
  orderIndex: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  parentId?: string;

  @ManyToOne(() => Category, (cat) => cat.children, { nullable: true })
  parent: Category;

  @OneToMany(() => Category, (cat) => cat.parent, { nullable: true })
  children: Category[];

  @Field(() => Boolean)
  @Column({ default: false })
  inSelection: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  inSeason: boolean;

  @Column({ nullable: true })
  imageId?: string;

  @OneToOne(() => File, (file) => file.category, { nullable: true })
  @JoinColumn()
  image?: File;

  @Field(() => CategoryImageGenerationStatusEnum)
  @Column('enum', {
    enum: CategoryImageGenerationStatusEnum,
    default: CategoryImageGenerationStatusEnum.PENDING,
  })
  imageGenerationStatus?: CategoryImageGenerationStatusEnum;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  imageGenerationError?: string;

  @Field(() => CategoryIconEnum, { nullable: true })
  @Column('enum', { enum: CategoryIconEnum, nullable: true })
  icon?: CategoryIconEnum;

  @Field(() => QuantityUnitEnum, { nullable: true })
  @Column({
    type: 'enum',
    enum: QuantityUnitEnum,
    enumName: quantityUnitEnumName,
    nullable: true,
  })
  primaryQuantityUnit?: QuantityUnitEnum;

  @Field(() => QuantityUnitEnum, { nullable: true })
  @Column({
    type: 'enum',
    enum: QuantityUnitEnum,
    enumName: quantityUnitEnumName,
    nullable: true,
  })
  secondaryQuantityUnit?: QuantityUnitEnum;

  @ManyToMany(() => Brand, (brand) => brand.categories)
  @JoinTable()
  brands: Brand[];

  @Field(() => [MeasurementTypeEnum])
  @Column({
    type: 'enum',
    enum: MeasurementTypeEnum,
    enumName: measurementTypeEnumName,
    array: true,
    default: [],
  })
  measurements: MeasurementTypeEnum[];

  @Column({ nullable: true })
  co2FactorId?: string;
  @ManyToOne(() => CO2Factor, (co2) => co2.id, { nullable: true })
  co2Factor?: CO2Factor;
}
