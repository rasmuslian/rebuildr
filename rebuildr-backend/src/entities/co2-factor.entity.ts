import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
export class CO2Factor {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    unique: true,
    comment: "Foreign id pointing to 'resourceId' in Boverket ",
  })
  resourceId: string;

  @Field()
  @Column({
    comment: "Co2 coefficient matching 'A1-A3 Conservative' in Boverket",
    type: 'float',
  })
  coefficient: number;

  @Field()
  @Column({ comment: "Matching 'name' in Boverket" })
  productName: string;

  @Field()
  @Column({ comment: 'Matching categories.text' })
  categoryName: string;

  @Column({ comment: 'What version in Boverket this data is based of' })
  version: string;
  @Column({ comment: 'When fetched data was updated at Boverket' })
  dataUpdatedAt: Date;

  @OneToMany(() => Category, (c) => c.co2Factor)
  categories: Category[];
}
