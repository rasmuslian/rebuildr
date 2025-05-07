import { Field } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  token: string;

  @Column()
  expiresAt: Date;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  @JoinColumn()
  user: User;
}
