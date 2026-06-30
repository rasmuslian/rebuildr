import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@ObjectType()
export class Identity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, unique: true })
  ssn?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true, type: 'timestamptz' })
  lastIdentifiedAt?: Date | null;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.identity)
  users: User[];
}
