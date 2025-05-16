import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Point,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { File } from './file.entity';

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
  projectPicture: File;
}
