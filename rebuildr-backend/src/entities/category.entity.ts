import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Category {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ name: 'parentId', nullable: true })
  parentId?: string;

  @ManyToOne(() => Category, (cat) => cat.id, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent?: Category;
}
