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

  @Column('timestamptz')
  paymentSentToRockerAt?: Date;
  @Column('timestamptz')
  paymentAcceptedByRockerAt?: Date;
  @Column('timestamptz')
  deliveredAt?: Date;
  @Column('timestamptz')
  approvedAt?: Date;
  @Column('timestamptz')
  disapprovedAt?: Date;
  @Column('timestamptz')
  payoutReceivedAt?: Date;
  @Column('timestamptz')
  failureAt?: Date;
}
