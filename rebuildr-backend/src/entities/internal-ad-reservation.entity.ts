import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from './product.entity';
import { OrganizationMember } from './organization-member.entity';

@Entity()
@ObjectType()
export class InternalAdReservation {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.internalReservations, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Field({ nullable: true })
  @Column({ nullable: true })
  reservedByOrganizationMemberId?: string;

  @Field(() => OrganizationMember, { nullable: true })
  @ManyToOne(() => OrganizationMember, { nullable: true, onDelete: 'SET NULL' })
  reservedByOrganizationMember?: OrganizationMember;

  @Field({ nullable: true })
  @Column({ nullable: true })
  reservedByOrganizationMemberName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  reservedByOrganizationMemberEmail?: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  quantity?: number;

  @Column({ nullable: true, type: 'float' })
  weightAtSale?: number | null;

  @Column({ nullable: true, type: 'float' })
  co2SavingBuyerAtSale?: number | null;

  @Column({ nullable: true, type: 'float' })
  co2SavingSellerAtSale?: number | null;

  @Column({ nullable: true, type: 'int' })
  marketValueAtSale?: number | null;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  reservedAt: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  canceledAt?: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  soldAt?: Date;
}
