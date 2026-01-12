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
  contactName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  contactPhone?: string;

  @Field(() => String)
  @Column()
  address: string;

  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  addressLocation: Point;

  @Column()
  userId: string;
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

  @Column()
  mapPinId: string;

  @OneToOne(() => MapPin, (mapPin) => mapPin.project, { cascade: true })
  @JoinColumn()
  mapPin: MapPin;
}
