import { Field } from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
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

  @OneToOne(() => User, (user) => user.refreshToken)
  @JoinColumn()
  user: User;
}
