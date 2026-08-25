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
import { OrganizationMember } from './organization-member.entity';
import { Product } from './product.entity';
import { User } from './user.entity';

export enum InternalAdImportBatchStatus {
  UPLOADING = 'UPLOADING',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
  PUBLISHED = 'PUBLISHED',
}
registerEnumType(InternalAdImportBatchStatus, {
  name: 'InternalAdImportBatchStatusEnum',
});

@Entity()
@ObjectType()
export class InternalAdImportBatch {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  organizationId: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  organization: User;

  @Field({ nullable: true })
  @Column({ nullable: true })
  organizationMemberId?: string;

  @ManyToOne(() => OrganizationMember, { nullable: true, onDelete: 'SET NULL' })
  organizationMember?: OrganizationMember;

  @Field(() => InternalAdImportBatchStatus)
  @Column({
    type: 'enum',
    enum: InternalAdImportBatchStatus,
    enumName: 'internal_ad_import_batch_status_enum',
    default: InternalAdImportBatchStatus.UPLOADING,
  })
  status: InternalAdImportBatchStatus;

  @Field(() => Int)
  @Column({ default: 0 })
  progress: number;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  errorMessage?: string;

  @ManyToMany(() => File)
  @JoinTable()
  files: File[];

  @OneToMany(() => Product, (product) => product.internalAdImportBatch)
  products: Product[];

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
