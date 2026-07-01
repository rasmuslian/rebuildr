import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

export enum OrganizationMemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}
registerEnumType(OrganizationMemberRole, {
  name: 'OrganizationMemberRoleEnum',
});

@Entity()
@Unique(['organizationId', 'userId'])
@ObjectType()
export class OrganizationMembership {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  organizationId: string;

  @ManyToOne(() => User, (user) => user.organizationMemberships, {
    onDelete: 'CASCADE',
  })
  organization: User;

  @Field()
  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.internalOrganizationMemberships, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Field(() => OrganizationMemberRole)
  @Column({
    type: 'enum',
    enum: OrganizationMemberRole,
    enumName: 'organization_member_role_enum',
    default: OrganizationMemberRole.MEMBER,
  })
  role: OrganizationMemberRole;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
