import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PageEnum } from '../constants/enums';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class PageContent extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => PageEnum)
  @Column({ unique: true, type: 'enum', enum: PageEnum })
  page: PageEnum;

  @Field()
  @Column()
  heroHtml: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
