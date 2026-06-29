import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';

export enum OrganizationRoleEnum {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}
export const organizationRoleEnumName = 'organization_role_enum';
registerEnumType(OrganizationRoleEnum, { name: 'OrganizationRoleEnum' });

@Entity()
@ObjectType()
@Unique(['organizationId', 'userId'])
export class OrganizationMembership {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, (org) => org.memberships, {
    onDelete: 'CASCADE',
  })
  organization: Organization;

  @Field()
  @Column()
  userId: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @Field(() => OrganizationRoleEnum)
  @Column({
    type: 'enum',
    enum: OrganizationRoleEnum,
    enumName: organizationRoleEnumName,
    default: OrganizationRoleEnum.MEMBER,
  })
  role: OrganizationRoleEnum;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
