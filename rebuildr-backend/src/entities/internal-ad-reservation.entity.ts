import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Product } from './product.entity';
import { User } from './user.entity';

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

  @Field()
  @Column()
  reservedByUserId: string;

  @ManyToOne(() => User, (user) => user.id)
  reservedByUser: User;

  @Field({ nullable: true })
  reservedByUserEmail?: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  quantity?: number;

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
