import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BygghjalpenChat } from './bygghjalpen-chat.entity';

export enum BygghjalpenMessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

@Entity()
export class BygghjalpenMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'enum', enum: BygghjalpenMessageRole })
  role: BygghjalpenMessageRole;

  @Column({ type: 'text' })
  content: string;

  @Column()
  chatId: string;

  @ManyToOne(() => BygghjalpenChat, (chat) => chat.messages, {
    onDelete: 'CASCADE',
  })
  chat: BygghjalpenChat;
}
