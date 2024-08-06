import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  Point,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RefreshToken } from './refreshToken.entity';

@Entity()
@ObjectType()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Column('geometry', { nullable: true })
  addressLocation?: Point;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken?: RefreshToken;
}
