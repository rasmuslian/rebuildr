import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Point,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum UserRoleEnum {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
registerEnumType(UserRoleEnum, { name: 'UserRoleEnum' });

@Entity()
@ObjectType()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  addressLocation?: Point;

  @Field(() => UserRoleEnum)
  @Column('enum', { enum: UserRoleEnum, default: UserRoleEnum.USER })
  role: UserRoleEnum;
}
