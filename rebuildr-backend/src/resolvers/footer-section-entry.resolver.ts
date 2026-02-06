import { Resolver, ResolveField, Root } from '@nestjs/graphql';
import { FooterSectionEntry } from 'src/entities/footer-section-entry.entity';
import { ArticleService } from 'src/services/article.service';
import { Article } from 'src/entities/article.entity';

@Resolver(() => FooterSectionEntry)
export class FooterSectionEntryResolver {
  constructor(private articleService: ArticleService) {}

  @ResolveField(() => Article, { nullable: true })
  async article(
    @Root() _articleFooterSection: FooterSectionEntry,
  ): Promise<Article> {
    if (!_articleFooterSection.articleId) {
      return null;
    }
    return this.articleService.findOne(_articleFooterSection.articleId);
  }
}
