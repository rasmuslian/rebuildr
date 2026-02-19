import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Category } from './category.entity';
import { User } from './user.entity';
import { Message } from './message.entity';
import { FileSourceEnum } from '../constants/enums';

@Entity()
@ObjectType()
export class File {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field()
  @Column()
  mimeType: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Product, (product) => product.images, { nullable: true })
  productImage?: Product;

  @ManyToOne(() => Product, (product) => product.documents, { nullable: true })
  productDocument?: Product;

  @OneToOne(() => Category, (category) => category.image, { nullable: true })
  category?: Category;

  @OneToOne(() => User, (user) => user.profilePicture, { nullable: true })
  @JoinColumn()
  user?: User;

  @Column({ type: Boolean, default: false })
  private: boolean;

  @Column({ type: 'enum', enum: FileSourceEnum, default: FileSourceEnum.APP })
  source: FileSourceEnum;

  @ManyToOne(() => Message, (message) => message.images, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  messageImage?: Message;

  @ManyToOne(() => Message, (message) => message.documents, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  messageDocument?: Message;
}
