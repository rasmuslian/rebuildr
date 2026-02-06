import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Article } from './article.entity';
import { FooterSection } from './footer-section.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum FooterSectionEntryType {
  ARTICLE = 'ARTICLE',
  LINK = 'LINK',
}
registerEnumType(FooterSectionEntryType, { name: 'FooterSectionEntryType' });

@Entity()
@ObjectType()
export class FooterSectionEntry extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => FooterSectionEntryType)
  @Column({ type: 'enum', enum: FooterSectionEntryType })
  type: FooterSectionEntryType;

  @Field({ nullable: true })
  @Column({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  url?: string | null;

  @Field()
  @Column({ default: 0 })
  orderIndex: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  articleId?: string;
  @ManyToOne(() => Article, (a) => a.footerSections, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  article?: Article;

  @Field()
  @Column()
  footerSectionId: string;
  @ManyToOne(() => FooterSection, (f) => f.entries, {
    onDelete: 'CASCADE',
  })
  footerSection: FooterSection;
}
