import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  Point,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Product } from './product.entity';
import { RefreshToken } from './refresh-token.entity';
import { UserProtectedMiddleware } from '../middlewares/user-protected.middleware';
import { Purchase } from './purchase.entity';

export enum UserRoleEnum {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
registerEnumType(UserRoleEnum, { name: 'UserRoleEnum' });

export enum RockerPayoutAccountStatusEnum {
  NOT_SET = 'NOT_SET',
  VERIFIED = 'VERIFIED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

@Entity()
@ObjectType()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({ unique: true })
  username: string;

  @Field(() => String, { middleware: [UserProtectedMiddleware] })
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String, {
    nullable: true,
    middleware: [UserProtectedMiddleware],
  })
  @Column({ nullable: true })
  address?: string;

  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  addressLocation?: Point;

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshToken?: RefreshToken;

  @OneToMany(() => Product, (product) => product)
  products: Product[];

  @Field(() => UserRoleEnum, { middleware: [UserProtectedMiddleware] })
  @Column('enum', { enum: UserRoleEnum, default: UserRoleEnum.USER })
  role: UserRoleEnum;

  @Column({ nullable: true })
  verifyEmailToken?: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @ManyToMany(() => Product, (product) => product.likedBy)
  likedProducts: Product[];

  @Column({ nullable: true })
  rockerUserId?: string; //id used in Rocker

  @Column('enum', {
    enum: RockerPayoutAccountStatusEnum,
    default: RockerPayoutAccountStatusEnum.NOT_SET,
  })
  rockerPayoutAccountSwish: RockerPayoutAccountStatusEnum;

  @OneToMany(() => Purchase, (p) => p.buyer)
  purchases: Purchase[];
}
