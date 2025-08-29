import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
export enum ReportProductTypeEnum {
  INCORRECT_INFORMATION = 'INCORRECT_INFORMATION',
  MISLEADING_ADVERTISEMENT = 'MISLEADING_ADVERTISEMENT',
  DUPLICATE_OR_SPAM = 'DUPLICATE_OR_SPAM',
  IRRELEVANT_PRODUCT = 'IRRELEVANT_PRODUCT',
  UNREASONABLE_PRICE = 'UNREASONABLE_PRICE',
  OTHER = 'OTHER',
}
registerEnumType(ReportProductTypeEnum, { name: 'ReportProductTypeEnum' });

@Entity()
@ObjectType()
export class ReportProduct {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => ReportProductTypeEnum)
  @Column({ type: 'enum', enum: ReportProductTypeEnum })
  type: ReportProductTypeEnum;

  @Field()
  @Column()
  message: string;

  @Field()
  @Column()
  reporterId: string;
  @ManyToOne(() => User, (u) => u.reportProducts)
  reporter: User;

  @Column()
  productId: string;
  @ManyToOne(() => Product, (p) => p.reportProducts)
  product: Product;
}
