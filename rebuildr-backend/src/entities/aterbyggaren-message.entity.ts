import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AterbyggarenChat } from './aterbyggaren-chat.entity';
import { File } from './file.entity';

export interface AterbyggarenDisplayedProduct {
  id: string;
  title: string;
  description?: string;
  additionalInfo?: string;
  primaryQuantity?: number;
  primaryUnit?: string;
  secondaryQuantity?: number;
  secondaryUnit?: string;
  height?: { value: number; unit: string };
  width?: { value: number; unit: string };
  length?: { value: number; unit: string };
  weight?: { value: number; unit: string };
  area?: string;
  distanceKm?: number;
  publishedAt?: Date;
  price: number;
  isGiveaway: boolean;
  condition: string;
  category?: string;
  brand?: string;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  likedByMe?: boolean | null;
  url: string;
  imageUrl?: string;
}

export interface AterbyggarenProductDisplay {
  type: 'products';
  products: AterbyggarenDisplayedProduct[];
}

export enum AterbyggarenMessageRole {
  USER = 'USER',
  ASSISTANT = 'ASSISTANT',
}

export enum AterbyggarenMessageStatus {
  COMPLETE = 'COMPLETE',
  INTERRUPTED = 'INTERRUPTED',
  FAILED = 'FAILED',
}

@Entity('aterbyggaren_message')
export class AterbyggarenMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'enum', enum: AterbyggarenMessageRole })
  role: AterbyggarenMessageRole;

  @Column({
    type: 'enum',
    enum: AterbyggarenMessageStatus,
    default: AterbyggarenMessageStatus.COMPLETE,
  })
  status: AterbyggarenMessageStatus;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  productDisplays?: AterbyggarenProductDisplay[] | null;

  @OneToMany(() => File, (file) => file.aterbyggarenMessageImage)
  images: File[];

  @OneToMany(() => File, (file) => file.aterbyggarenMessageDocument)
  documents: File[];

  @Column()
  chatId: string;

  @ManyToOne(() => AterbyggarenChat, (chat) => chat.messages, {
    onDelete: 'CASCADE',
  })
  chat: AterbyggarenChat;
}
