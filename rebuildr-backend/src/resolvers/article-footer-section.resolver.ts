import { Resolver, ResolveField, Root } from '@nestjs/graphql';
import { ArticleFooterSection } from 'src/entities/article-footer-section.entity';
import { ArticleService } from 'src/services/article.service';
import { Article } from 'src/entities/article.entity';

@Resolver(() => ArticleFooterSection)
export class ArticleFooterSectionResolver {
  constructor(private articleService: ArticleService) {}

  @ResolveField(() => Article)
  async article(
    @Root() _articleFooterSection: ArticleFooterSection,
  ): Promise<Article> {
    return this.articleService.findOne(_articleFooterSection.articleId);
  }
}
