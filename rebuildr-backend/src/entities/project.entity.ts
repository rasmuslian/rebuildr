import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  Point,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { File } from './file.entity';
import { MapPin } from './map-pin.entity';

@Entity()
@ObjectType()
export class Project {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  shortText?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  contactName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  contactPhone?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  addressLocation?: Point;

  @Column()
  userId: string;

  /** NULL denotes an ordinary marketplace project; set for Internlagret projects. */
  @Column({ nullable: true })
  internalOrganizationId?: string;
  @ManyToOne(() => User, { nullable: true })
  internalOrganization?: User;
  @ManyToOne(() => User, (u) => u.projects)
  user: User;

  @OneToMany(() => Product, (p) => p.project)
  products: Product[];

  @Column({ nullable: true })
  projectPictureId?: string;
  @OneToOne(() => File, { nullable: true })
  @JoinColumn()
  projectPicture?: File;

  @ManyToMany(() => User, (user) => user.likedProjects, { cascade: true })
  @JoinTable()
  likedBy: User[];

  @Column({ nullable: true })
  mapPinId?: string;

  @OneToOne(() => MapPin, (mapPin) => mapPin.project, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  mapPin: MapPin;

  @Field()
  @Column({ default: false })
  showDetailsOnMap: boolean;
}
