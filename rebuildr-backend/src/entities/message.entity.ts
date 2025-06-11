import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
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

export enum MessageTypeEnum {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
}
registerEnumType(MessageTypeEnum, { name: 'MessageTypeEnum' });

@Entity()
@ObjectType()
export class Message {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Type(() => Date)
  @Expose({ name: 'createdAt' })
  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @Column()
  message: string;

  @Expose({ name: 'senderId' })
  @Field(() => ID)
  @Column()
  senderId: string;

  @ManyToOne(() => User, (user) => user.id)
  sender: User;

  @Expose({ name: 'receiverId' })
  @Field(() => ID)
  @Column()
  receiverId: string;

  @ManyToOne(() => User, (user) => user.id)
  receiver: User;

  @Expose({ name: 'productId' })
  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.id)
  product: Product;

  @Column({ type: 'timestamptz', nullable: true })
  @Field(() => Date, { nullable: true })
  readAt?: Date | null;

  @Field(() => MessageTypeEnum)
  @Column('enum', { enum: MessageTypeEnum, default: MessageTypeEnum.USER })
  messageType: MessageTypeEnum;
}
