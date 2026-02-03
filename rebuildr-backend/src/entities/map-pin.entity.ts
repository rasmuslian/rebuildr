import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  OneToOne,
  Point,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from './project.entity';
import { User } from './user.entity';
import { Product } from './product.entity';

export enum MapPinTypeEnum {
  PRODUCT = 'PRODUCT',
  PROJECT = 'PROJECT',
  HUB = 'HUB',
  USER = 'USER',
  FEATURED = 'FEATURED',
}

registerEnumType(MapPinTypeEnum, { name: 'MapPinTypeEnum' });

@Entity()
@ObjectType()
export class MapPin {
  constructor(init?: Partial<MapPin>) {
    Object.assign(this, init);
  }
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location?: Point;

  @Column({ nullable: true })
  address?: string;

  @OneToOne(() => Product, (product) => product.mapPin, { nullable: true })
  product?: Product;

  @OneToOne(() => User, (user) => user.mapPin, { nullable: true })
  user?: User;

  @OneToOne(() => Project, (project) => project.mapPin, { nullable: true })
  project?: Project;
}
