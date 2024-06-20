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
import { Expose, Type } from 'class-transformer';

@Entity()
@ObjectType()
export class Message {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Type(() => Date)
  @Expose({ name: 'created_at' })
  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @Column()
  body: string;

  @Expose({ name: 'sender_id' })
  @Field(() => ID)
  @Column()
  senderId: string;

  @ManyToOne(() => User, (user) => user.id)
  sender: User;

  @Expose({ name: 'receiver_id' })
  @Field(() => ID)
  @Column()
  receiverId: string;

  @ManyToOne(() => User, (user) => user.id)
  receiver: User;

  @Expose({ name: 'product_id' })
  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.id)
  product: Product;
}
