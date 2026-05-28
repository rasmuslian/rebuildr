import { Context, Resolver, ResolveField, Root } from '@nestjs/graphql';

import { IFooterSectionLoaders } from 'src/dataloaders/footer-section.loader';
import { Article } from 'src/entities/article.entity';
import { FooterSectionEntry } from 'src/entities/footer-section-entry.entity';

@Resolver(() => FooterSectionEntry)
export class FooterSectionEntryResolver {
  @ResolveField(() => Article, { nullable: true })
  async article(
    @Root() _articleFooterSection: FooterSectionEntry,
    @Context('footerSectionLoaders')
    footerSectionLoaders: IFooterSectionLoaders,
  ): Promise<Article> {
    if (!_articleFooterSection.articleId) {
      return null;
    }
    return footerSectionLoaders.articleLoader.load(
      _articleFooterSection.articleId,
    );
  }
}
