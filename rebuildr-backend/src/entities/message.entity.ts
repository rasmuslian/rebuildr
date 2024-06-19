import { Field, ID, ObjectType } from '@nestjs/graphql';
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
export class Message {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @Column()
  body: string;

  @Field(() => ID)
  @Column()
  senderId: string;

  @ManyToOne(() => User, (user) => user.id)
  sender: User;

  @Field(() => ID)
  @Column()
  receiverId: string;

  @ManyToOne(() => User, (user) => user.id)
  receiver: User;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.id)
  product: Product;
}
