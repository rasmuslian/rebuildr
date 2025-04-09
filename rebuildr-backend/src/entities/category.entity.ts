import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
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
import { QuantityUnitEnum, quantityUnitEnumName } from './enums';
import { Brand } from './brand.entity';

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

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  parentId?: string;

  @ManyToOne(() => Category, (cat) => cat.children, { nullable: true })
  parent?: Category;

  @OneToMany(() => Category, (cat) => cat.parent, { nullable: true })
  children?: Category[];

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

  @Field(() => CategoryIconEnum, { nullable: true })
  @Column('enum', { enum: CategoryIconEnum, nullable: true })
  icon?: CategoryIconEnum;

  @Column({
    type: 'enum',
    enum: QuantityUnitEnum,
    enumName: quantityUnitEnumName,
    nullable: true,
  })
  primaryQuantityUnit?: QuantityUnitEnum;

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
}
