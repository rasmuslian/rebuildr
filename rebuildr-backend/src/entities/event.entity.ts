import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum EventType {
  API_REQUEST = 'API_REQUEST',
  CATEGORY_VISIT = 'CATEGORY_VISIT',
}

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: EventType })
  type: EventType;

  @Column({ nullable: true })
  value?: string;

  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true })
  user?: User;

  @CreateDateColumn()
  createdAt: Date;
}
