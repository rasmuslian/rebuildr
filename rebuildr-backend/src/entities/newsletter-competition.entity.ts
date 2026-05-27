import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { File } from './file.entity';

@Entity()
@ObjectType()
export class NewsletterCompetition {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  productTitle: string;

  @Field()
  @Column()
  productValue: string;

  @Field()
  @Column('text')
  bodyText: string;

  @Field(() => Date)
  @Column()
  nextDrawDate: Date;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, (f) => f.id, { nullable: true, eager: true })
  @JoinColumn()
  productImage?: File;
}
