import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { OrganizationMemberRole } from './organization-membership.entity';
import { User } from './user.entity';

export enum OrganizationInviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REVOKED = 'REVOKED',
}
registerEnumType(OrganizationInviteStatus, {
  name: 'OrganizationInviteStatusEnum',
});

@Entity()
@Unique(['token'])
@ObjectType()
export class OrganizationInvite {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  email: string;

  @Column()
  token: string;

  @Field()
  @Column()
  organizationId: string;

  @ManyToOne(() => User, (user) => user.organizationInvites, {
    onDelete: 'CASCADE',
  })
  organization: User;

  @Field()
  @Column()
  invitedByUserId: string;

  @ManyToOne(() => User, (user) => user.id)
  invitedByUser: User;

  @Field(() => OrganizationMemberRole)
  @Column({
    type: 'enum',
    enum: OrganizationMemberRole,
    enumName: 'organization_member_role_enum',
    default: OrganizationMemberRole.MEMBER,
  })
  role: OrganizationMemberRole;

  @Field(() => OrganizationInviteStatus)
  @Column({
    type: 'enum',
    enum: OrganizationInviteStatus,
    enumName: 'organization_invite_status_enum',
    default: OrganizationInviteStatus.PENDING,
  })
  status: OrganizationInviteStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  acceptedByUserId?: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  acceptedByUser?: User;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true })
  acceptedAt?: Date;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
