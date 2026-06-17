import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BygghjalpenChat } from './bygghjalpen-chat.entity';

export interface BygghjalpenDisplayedProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  isGiveaway: boolean;
  condition: string;
  category?: string;
  brand?: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  url: string;
  imageUrl?: string;
}

export interface BygghjalpenProductDisplay {
  type: 'products';
  products: BygghjalpenDisplayedProduct[];
}

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

  @Column({ type: 'jsonb', nullable: true })
  productDisplays?: BygghjalpenProductDisplay[] | null;

  @Column()
  chatId: string;

  @ManyToOne(() => BygghjalpenChat, (chat) => chat.messages, {
    onDelete: 'CASCADE',
  })
  chat: BygghjalpenChat;
}
