import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Column, Entity, JoinColumn, OneToOne, Point, PrimaryGeneratedColumn } from "typeorm";
import { Project } from "./project.entity";
import { User } from "./user.entity";
import { Product } from "./product.entity";

export enum MapPinTypeEnum {
  PRODUCT = "PRODUCT",
  PROJECT = "PROJECT",
  USER = "USER",
}

registerEnumType(MapPinTypeEnum, { name: "MapPinTypeEnum" });

// Used for approximate location display on maps
@Entity()
@ObjectType()
export class MapPin {
  constructor(init?: Partial<MapPin>) {
    Object.assign(this, init);
  }
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location?: Point;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  productId: string;

  @OneToOne(() => Product, product => product.mapPin, { nullable: true })
  @JoinColumn()
  product: Product;

  @Column({ nullable: true })
  userId: string;

  @OneToOne(() => User, user => user.mapPin, { nullable: true })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  projectId: string;

  @OneToOne(() => Project, project => project.mapPin, { nullable: true })
  @JoinColumn()
  project: Project;
}