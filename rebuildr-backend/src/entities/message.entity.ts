import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Expose, Type } from 'class-transformer';
import { File } from './file.entity';
import { Conversation } from './conversation.entity';

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
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @Column()
  message: string;

  @Expose({ name: 'senderId' })
  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  senderId?: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  sender?: User;

  //Undefined receive means all can read it.
  // Otherwise only the receiver will read it
  //System messages will target a receiver for example
  @Expose({ name: 'receiverId' })
  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  receiverId?: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  receiver?: User;

  @Field(() => MessageTypeEnum)
  @Column('enum', { enum: MessageTypeEnum, default: MessageTypeEnum.USER })
  messageType: MessageTypeEnum;

  @Field(() => [String], { nullable: true })
  imagePutUrls?: string[] | null;

  @OneToMany(() => File, (file) => file.messageImage)
  images: File[];

  @Field(() => [String], { nullable: true })
  documentPutUrls?: string[] | null;

  @OneToMany(() => File, (file) => file.messageDocument)
  documents: File[];

  @Field()
  @Column()
  conversationId: string;
  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;
}
