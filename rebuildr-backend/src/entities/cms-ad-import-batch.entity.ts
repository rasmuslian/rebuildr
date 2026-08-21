import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { File } from './file.entity';
import { Product } from './product.entity';
import { User } from './user.entity';

export enum CmsAdImportBatchStatus {
  UPLOADING = 'UPLOADING',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  PUBLISHED = 'PUBLISHED',
}
registerEnumType(CmsAdImportBatchStatus, {
  name: 'CmsAdImportBatchStatusEnum',
});

@Entity()
@ObjectType()
export class CmsAdImportBatch {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  sellerId: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  seller: User;

  @Field({ nullable: true })
  @Column({ nullable: true })
  defaultAddress?: string;

  @Field()
  @Column({ default: false })
  defaultPickupEnabled: boolean;

  @Field()
  @Column({ default: false })
  defaultDeliveryEnabled: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'float' })
  defaultDeliveryRadius?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  defaultDeliveryPrice?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  defaultShippingPriceId?: string;

  @Field()
  @Column()
  createdByUserId: string;

  @ManyToOne(() => User, (user) => user.id)
  createdByUser: User;

  @Field(() => CmsAdImportBatchStatus)
  @Column({
    type: 'enum',
    enum: CmsAdImportBatchStatus,
    enumName: 'cms_ad_import_batch_status_enum',
    default: CmsAdImportBatchStatus.UPLOADING,
  })
  status: CmsAdImportBatchStatus;

  @Field(() => Int)
  @Column({ default: 0 })
  progress: number;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  errorMessage?: string;

  @ManyToMany(() => File)
  @JoinTable()
  files: File[];

  @Field(() => [Product])
  @OneToMany(() => Product, (product) => product.cmsAdImportBatch)
  products: Product[];

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
