import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import {
  OrganizationRoleEnum,
  organizationRoleEnumName,
} from './organization-membership.entity';

export enum OrganizationInviteStatusEnum {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REVOKED = 'REVOKED',
}
export const organizationInviteStatusEnumName =
  'organization_invite_status_enum';
registerEnumType(OrganizationInviteStatusEnum, {
  name: 'OrganizationInviteStatusEnum',
});

/**
 * An invitation for a colleague (by email) to join an organization. Accepting
 * it creates an OrganizationMembership, giving them access to the shared
 * internal inventory.
 */
@Entity()
@ObjectType()
export class OrganizationInvite {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Field()
  @Column()
  email: string;

  @Field(() => OrganizationRoleEnum)
  @Column({
    type: 'enum',
    enum: OrganizationRoleEnum,
    enumName: organizationRoleEnumName,
    default: OrganizationRoleEnum.MEMBER,
  })
  role: OrganizationRoleEnum;

  @Field(() => OrganizationInviteStatusEnum)
  @Column({
    type: 'enum',
    enum: OrganizationInviteStatusEnum,
    enumName: organizationInviteStatusEnumName,
    default: OrganizationInviteStatusEnum.PENDING,
  })
  status: OrganizationInviteStatusEnum;

  @Field()
  @Column({ unique: true })
  token: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  invitedByUserId?: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'timestamptz' })
  acceptedAt?: Date;
}
