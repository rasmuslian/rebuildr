import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class Purchase {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  productId: string;
  @ManyToOne(() => Product, (p) => p.purchases)
  product: Product;

  @Column()
  buyerId: string;
  @ManyToOne(() => User, (u) => u.purchases)
  buyer: User;

  @Column({ nullable: true, unique: true })
  rockerPaymentId?: string;

  @Column({ nullable: true })
  rockerOfferId?: string;

  @Column({ nullable: true })
  rockerPayoutId?: string;

  @Column('timestamptz', { nullable: true })
  paymentSentToRockerAt?: Date;
  @Column('timestamptz', { nullable: true })
  paymentAcceptedByRockerAt?: Date;
  @Column('timestamptz', { nullable: true })
  deliveredAt?: Date;
  @Column('timestamptz', { nullable: true })
  approvedAt?: Date;
  @Column('timestamptz', { nullable: true })
  disapprovedAt?: Date;
  @Column('timestamptz', { nullable: true })
  payoutStartedAt?: Date;
  @Column('timestamptz', { nullable: true })
  payoutReceivedAt?: Date;
  @Column('timestamptz', { nullable: true })
  failedAt?: Date;
}
