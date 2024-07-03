import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  mimeType: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  productId?: string;

  @ManyToOne(() => Product, (product) => product.id, { nullable: true })
  product?: Product;
}
