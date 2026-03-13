import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Purchase } from './purchase.entity';

export enum ReportPurchaseTypeEnum {
  NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED ',
  DAMAGED = 'DAMAGED',
  WRONG_PRODUCT = 'WRONG_PRODUCT',
  PRODUCT_MISSING = 'PRODUCT_MISSING',
  OTHER = 'OTHER',
}
registerEnumType(ReportPurchaseTypeEnum, { name: 'ReportPurchaseTypeEnum' });

export enum ReportPurchaseResolutionEnum {
  REFUND = 'REFUND',
  PROCEED = 'PROCEED',
  OTHER = 'OTHER',
}
registerEnumType(ReportPurchaseResolutionEnum, {
  name: 'ReportPurchaseResolutionEnum',
});

@Entity()
@ObjectType()
export class ReportPurchase {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => ReportPurchaseTypeEnum)
  @Column({ type: 'enum', enum: ReportPurchaseTypeEnum })
  type: ReportPurchaseTypeEnum;

  @Field()
  @Column()
  message: string;

  @Field(() => ReportPurchaseResolutionEnum, { nullable: true })
  @Column({ type: 'enum', enum: ReportPurchaseResolutionEnum, nullable: true })
  resolution?: ReportPurchaseResolutionEnum;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt?: Date;

  @Column()
  purchaseId: string;
  @OneToOne(() => Purchase, (p) => p.reportPurchase, { onDelete: 'CASCADE' })
  @JoinColumn()
  purchase: Purchase;
}
