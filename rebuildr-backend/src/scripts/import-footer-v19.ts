import slugify from 'slugify';
import { In } from 'typeorm';

import { Article } from 'src/entities/article.entity';
import {
  FooterSectionEntry,
  FooterSectionEntryType,
} from 'src/entities/footer-section-entry.entity';
import { FooterSection } from 'src/entities/footer-section.entity';
import { dataSource } from 'src/ormconfig-migrations';
import { FOOTER_V19_SECTIONS } from 'src/scripts/footer-v19.content';

const STAGED_ARTICLES = new Set(['Återbanken®', 'Så funkar Ukrainaknappen']);

const FOOTER_LABELS: Record<string, string> = {
  'Ekonomi och återbruk': 'Ekonomi återbruk',
  'Så funkar Återbyggaren®': 'Återbyggaren®',
  'Så funkar Ukrainaknappen': 'Ukrainaknappen',
};

const shouldIncludeArticle = (title: string, includeStaged: boolean) =>
  includeStaged || !STAGED_ARTICLES.has(title);

const slugFor = (title: string) =>
  slugify(title, { lower: true, strict: true, locale: 'sv' });

const main = async () => {
  const apply = process.argv.includes('--apply');
  const includeStaged = process.argv.includes('--include-staged');
  const sections = FOOTER_V19_SECTIONS.map((section) => ({
    ...section,
    articles: section.articles.filter((article) =>
      shouldIncludeArticle(article.title, includeStaged),
    ),
  }));
  const articles = sections.flatMap((section) => section.articles);

  if (!apply) {
    console.log('Dry run — no changes will be made. Pass --apply to import.');
  }
  console.log(
    `Preparing ${articles.length} articles and ${sections.length} footer sections${
      includeStaged ? ', including staged content.' : '.'
    }`,
  );

  const database = await dataSource;
  await database.initialize();
  const runner = database.createQueryRunner();
  await runner.connect();

  try {
    const articleRepository = runner.manager.getRepository(Article);
    const sectionRepository = runner.manager.getRepository(FooterSection);
    const entryRepository = runner.manager.getRepository(FooterSectionEntry);

    const existingArticles = await articleRepository.findBy({
      slug: In(articles.map((article) => slugFor(article.title))),
    });
    const existingBySlug = new Map(
      existingArticles.map((article) => [article.slug, article]),
    );
    const existingSections = await sectionRepository.findBy({
      title: In(sections.map((section) => section.title)),
    });
    const existingSectionsByTitle = new Map(
      existingSections.map((section) => [section.title, section]),
    );

    console.table({
      articlesToCreate: articles.filter(
        (article) => !existingBySlug.has(slugFor(article.title)),
      ).length,
      articlesToUpdate: articles.filter((article) =>
        existingBySlug.has(slugFor(article.title)),
      ).length,
      sectionsToCreate: sections.filter(
        (section) => !existingSectionsByTitle.has(section.title),
      ).length,
      sectionsToReplace: sections.filter((section) =>
        existingSectionsByTitle.has(section.title),
      ).length,
    });

    if (!apply) return;

    await runner.startTransaction();

    for (const articleInput of articles) {
      const slug = slugFor(articleInput.title);
      const existing = existingBySlug.get(slug);

      if (existing) {
        existing.title = articleInput.title;
        existing.body = articleInput.body;
        await articleRepository.save(existing);
      } else {
        const article = await articleRepository.save(
          articleRepository.create({
            title: articleInput.title,
            slug,
            body: articleInput.body,
          }),
        );
        existingBySlug.set(slug, article);
      }
    }

    for (const [sectionIndex, sectionInput] of sections.entries()) {
      let section = existingSectionsByTitle.get(sectionInput.title);
      if (section) {
        section.orderIndex = sectionIndex;
        await sectionRepository.save(section);
        await entryRepository.delete({ footerSectionId: section.id });
      } else {
        section = await sectionRepository.save(
          sectionRepository.create({
            title: sectionInput.title,
            orderIndex: sectionIndex,
          }),
        );
      }

      await entryRepository.save(
        sectionInput.articles.map((articleInput, orderIndex) => {
          const article = existingBySlug.get(slugFor(articleInput.title));
          if (!article)
            throw new Error(`Article not found: ${articleInput.title}`);

          return entryRepository.create({
            type: FooterSectionEntryType.ARTICLE,
            label: FOOTER_LABELS[articleInput.title] ?? articleInput.title,
            orderIndex,
            articleId: article.id,
            footerSectionId: section.id,
          });
        }),
      );
    }

    await runner.commitTransaction();
    console.log('Footer v19 import completed.');
  } catch (error) {
    if (runner.isTransactionActive) await runner.rollbackTransaction();
    throw error;
  } finally {
    await runner.release();
    await database.destroy();
  }
};

main().catch((error) => {
  console.error('Footer v19 import failed:', error);
  process.exitCode = 1;
});
