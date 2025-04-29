import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum ShippingProviderEnum {
  POSTNORD = 'POSTNORD',
  DHL = 'DHL',
}
registerEnumType(ShippingProviderEnum, { name: 'ShippingProviderEnum' });

@Entity()
@ObjectType()
export class ShippingPrice extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('float')
  maxWeight: number; //In kg

  @Column()
  price: number;

  @Field(() => ShippingProviderEnum)
  @Column('enum', { enum: ShippingProviderEnum })
  provider: ShippingProviderEnum;

  @ManyToMany(() => Product, (p) => p.shippingPrices)
  products: Product[];
}
