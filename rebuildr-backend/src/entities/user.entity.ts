import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Point,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';
import { Product } from './product.entity';
import { RefreshToken } from './refresh-token.entity';
import { UserProtectedMiddleware } from '../middlewares/user-protected.middleware';
import { Purchase } from './purchase.entity';
import { Project } from './project.entity';
import { SearchResult } from './search-result.entity';
import { File } from './file.entity';
import { Review } from './review.entity';

export enum UserRoleEnum {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
registerEnumType(UserRoleEnum, { name: 'UserRoleEnum' });

export enum UserType {
  PERSONAL = 'PERSONAL',
  BUSINESS = 'BUSINESS',
}
registerEnumType(UserType, { name: 'UserType' });

export enum RegistrationStatusEnum {
  EMAIL = 'EMAIL',
  DETAILS = 'DETAILS',
  DONE = 'DONE',
}
registerEnumType(RegistrationStatusEnum, { name: 'RegisterStatusEnum' });

export enum PayoutAccountEnum {
  SWISH = 'SWISH',
  TRUSTLY = 'TRUSTLY',
  RIX = 'RIX',
  BANKGIRO = 'BANKGIRO',
  PLUSGIRO = 'PLUGIRO',
}
registerEnumType(PayoutAccountEnum, { name: 'PayoutAccountEnum' });

@Entity()
@ObjectType()
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, unique: true })
  username?: string;

  @Field(() => String, {
    nullable: true,
    middleware: [UserProtectedMiddleware],
  })
  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date | null;

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

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'character varying' })
  postCode?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'character varying' })
  city?: string | null;

  @Field({ nullable: true })
  @Column({ nullable: true })
  phoneNumber?: string;

  @OneToOne(() => File, (file) => file.user, { nullable: true })
  profilePicture?: File | null;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[];

  @Field(() => UserRoleEnum, { middleware: [UserProtectedMiddleware] })
  @Column('enum', { enum: UserRoleEnum, default: UserRoleEnum.USER })
  role: UserRoleEnum;

  @Column({ nullable: true })
  verifyEmailToken?: string;

  @Column({ nullable: true })
  emailVerifiedAt?: Date;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @ManyToMany(() => Product, (product) => product.likedBy)
  likedProducts: Product[];

  @Column({ nullable: true })
  rockerUserId?: string; //id used in Rocker

  //following id's are id of each respective payout account method
  @Column({ nullable: true })
  payoutAccountSwishId?: string;
  @Column({ nullable: true })
  payoutAccountRixId?: string;
  @Column({ nullable: true })
  payoutAccountBankGiroId?: string;
  @Column({ nullable: true })
  payoutAccountPlusGiroId?: string;

  @Field(() => PayoutAccountEnum, { nullable: true })
  @Column('enum', { enum: PayoutAccountEnum, nullable: true })
  selectedPayoutMethod?: PayoutAccountEnum;

  @OneToMany(() => Purchase, (p) => p.buyer)
  purchases: Purchase[];

  @Field(() => UserType)
  @Column('enum', {
    enum: UserType,
    default: UserType.PERSONAL,
  })
  type: UserType;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, unique: true })
  organizationNumber?: string | null;

  @ManyToMany(() => User, (user) => user.organizationUsers)
  @JoinTable({
    joinColumn: { name: 'personalAccountId' },
    inverseJoinColumn: { name: 'organizationAccountId' },
  })
  organizations: User[];

  @ManyToMany(() => User, (user) => user.organizations)
  organizationUsers: User[];

  @Field(() => Date, { nullable: true })
  @Column({ type: Date, nullable: true })
  organizationApprovedAt?: Date;

  @Field()
  @Column({ type: Boolean, default: true })
  notifyOnMessage: boolean;
  @Field()
  @Column({ type: Boolean, default: true })
  notifyOnBuy: boolean;
  @Field()
  @Column({ type: Boolean, default: true })
  notifyOnSale: boolean;

  @OneToMany(() => Project, (p) => p.user)
  projects: Project[];

  @OneToMany(() => SearchResult, (searchResult) => searchResult.searcher)
  searchResults: SearchResult[];

  @OneToMany(() => Review, (review) => review.reviewer)
  reviews: Review[];

  @OneToMany(() => Review, (review) => review.reviewee)
  reviewed: Review[];
}
