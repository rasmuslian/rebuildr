import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AterbyggarenMessage } from './aterbyggaren-message.entity';
import { User } from './user.entity';

@Entity('bygghjalpen_chat')
export class AterbyggarenChat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user?: User;

  @Column({ nullable: true })
  guestId?: string;

  @Column({ type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @OneToMany(() => AterbyggarenMessage, (message) => message.chat)
  messages: AterbyggarenMessage[];
}
