import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Purchase } from './purchase.entity';
import { Product } from './product.entity';

@Entity()
@ObjectType()
export class Review extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @Field(() => Int)
  stars: number;

  @Column()
  @Field(() => String)
  review: string;

  //Many to one since a purchase can have a review from the seller and the buyer
  @Column()
  purchaseId: string;
  @ManyToOne(() => Purchase, (purchase) => purchase.reviews, { nullable: true })
  purchase?: Purchase;

  @Column()
  productId: string;
  @ManyToOne(() => Product, (product) => product.reviews, { nullable: true })
  product: Product;

  @Column()
  reviewerId: string;
  @ManyToOne(() => User, (user) => user.reviews)
  reviewer: User;

  @Column()
  revieweeId: string;
  @ManyToOne(() => User, (user) => user.reviewed)
  reviewee: User;
}
