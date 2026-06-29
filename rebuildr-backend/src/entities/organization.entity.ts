import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrganizationMembership } from './organization-membership.entity';

/**
 * A larger actor (construction / property owner) that owns an internal
 * inventory ("internlager"). Distinct from a small business seller, which is
 * still modelled as a User with type=BUSINESS — this is additive.
 */
@Entity()
@ObjectType()
export class Organization {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  organizationNumber?: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date | null;

  @OneToMany(() => OrganizationMembership, (m) => m.organization)
  memberships: OrganizationMembership[];
}
