import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';
import { Purchase } from './purchase.entity';
import { Message } from './message.entity';

@Entity()
@ObjectType()
export class Conversation {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => ID)
  @Column()
  buyerId: string;

  @ManyToOne(() => User, (user) => user.id)
  buyer: User;

  @Column({ type: 'timestamptz', nullable: true })
  @Field(() => Date, { nullable: true })
  sellerReadAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  @Field(() => Date, { nullable: true })
  buyerReadAt?: Date | null;

  @Field()
  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.id)
  product: Product;

  @Field({ nullable: true })
  @Column({ nullable: true })
  purchaseId?: string;

  @ManyToOne(() => Purchase, (purchase) => purchase.id, { nullable: true })
  purchase?: Purchase;

  @OneToMany(() => Message, (m) => m.conversation)
  messages: Message[];
}
