import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Article } from './article.entity';
import { FooterSection } from './footer-section.entity';
import { Entity, BaseEntity, PrimaryColumn, Column, ManyToOne } from 'typeorm';

@Entity()
@ObjectType()
export class ArticleFooterSection extends BaseEntity {
  @Field(() => ID)
  @PrimaryColumn('uuid')
  articleId: string;

  @Field(() => ID)
  @PrimaryColumn('uuid')
  footerSectionId: string;

  @Field()
  @Column({ default: 0 })
  orderIndex: number;

  @ManyToOne(() => Article, (a) => a.articleFooterSections, {
    onDelete: 'CASCADE',
  })
  article: Article;

  @ManyToOne(() => FooterSection, (f) => f.articleFooterSections, {
    onDelete: 'CASCADE',
  })
  footerSection: FooterSection;
}
