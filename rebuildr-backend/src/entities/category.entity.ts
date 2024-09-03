import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { File } from './file.entity';

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
  @Column({ nullable: true })
  parentId?: string;

  @ManyToOne(() => Category, (cat) => cat.id)
  parent?: Category;

  @Field(() => Boolean)
  @Column({ default: false })
  inSelection: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  inSeason: boolean;

  @Column({ nullable: true })
  iconId?: string;

  @OneToOne(() => File, (file) => file.category, { nullable: true })
  @JoinColumn()
  icon?: File;
}
