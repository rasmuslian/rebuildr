import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { FooterSectionEntry } from './footer-section-entry.entity';

@Entity()
@ObjectType()
export class Article extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column({ unique: true })
  slug: string;

  @Field()
  @Column()
  body: string;

  // Internal/in-app content (modal copy, legacy dumps, test articles): kept out
  // of the sitemap and noindexed, but still rendered as a page for in-app use.
  @Field()
  @Column({ default: false })
  isInternal: boolean;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @OneToMany(() => FooterSectionEntry, (entry) => entry.article)
  footerSections: FooterSectionEntry[];
}
