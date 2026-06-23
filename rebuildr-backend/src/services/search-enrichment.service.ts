import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Inject, Injectable } from '@nestjs/common';
import { generateText, Output } from 'ai';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { z } from 'zod';
import { Logger } from 'winston';

type ProductSearchContext = {
  title: string;
  description?: string | null;
  categoryName?: string | null;
  parentCategoryName?: string | null;
  categorySearchAliases?: string[] | null;
  brandName?: string | null;
};

type ProductSearchEnrichment = {
  searchAliases: string[];
  searchRelatedTerms: string[];
  searchUseCases: string[];
};

type ProductSearchDocumentInput = ProductSearchContext &
  ProductSearchEnrichment;

const MAX_DIRECT_ALIASES = 12;
const MAX_RELATED_TERMS = 10;
const MAX_USE_CASES = 8;

const categoryAliasSchema = z.object({
  aliases: z.array(z.string()).max(MAX_DIRECT_ALIASES),
});

const productSearchEnrichmentSchema = z.object({
  searchAliases: z.array(z.string()).max(MAX_DIRECT_ALIASES),
  searchRelatedTerms: z.array(z.string()).max(MAX_RELATED_TERMS),
  searchUseCases: z.array(z.string()).max(MAX_USE_CASES),
});

@Injectable()
export class SearchEnrichmentService {
  private google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async generateCategoryAliases(input: {
    name: string;
    description?: string | null;
    parentName?: string | null;
  }): Promise<string[]> {
    const fallbackAliases = this.createFallbackTerms([
      input.name,
      input.description,
      input.parentName,
    ]);

    try {
      const { output } = await generateText({
        model: this.google('gemini-3.5-flash'),
        output: Output.object({
          schema: categoryAliasSchema,
        }),
        prompt: `
You generate Swedish search aliases for RebuildR, a marketplace for reclaimed building materials.

Return strict JSON matching the schema. Swedish terms only. Use construction/building marketplace terminology.
Generate 5-12 useful aliases that help users find this category when they search related product terms.
Do not include brands. Do not include overly broad terms unless they are genuinely useful for this category.
Do not include duplicate terms. Prefer lowercase.

Category: ${input.name}
Parent category: ${input.parentName ?? 'Saknas'}
Description: ${input.description ?? 'Saknas'}
`,
      });

  return this.sanitizeTerms([...output.aliases, ...fallbackAliases]).slice(
        0,
        MAX_DIRECT_ALIASES,
      );
    } catch (error) {
      this.logger.warn('Category search alias generation failed', {
        categoryName: input.name,
        error: error instanceof Error ? error.message : String(error),
      });
      return fallbackAliases.slice(0, MAX_DIRECT_ALIASES);
    }
  }

  async generateProductSearchEnrichment(
    input: ProductSearchContext,
  ): Promise<ProductSearchEnrichment> {
    const fallbackTerms = this.createFallbackTerms([
      input.title,
      input.description,
      input.categoryName,
      input.parentCategoryName,
      ...(input.categorySearchAliases ?? []),
    ]);

    try {
      const { output } = await generateText({
        model: this.google('gemini-3.5-flash'),
        output: Output.object({
          schema: productSearchEnrichmentSchema,
        }),
        prompt: `
You generate Swedish search term aliases/related terms/use cases for RebuildR, a marketplace for reclaimed building materials.

Return strict JSON matching the schema. Swedish terms only. Use construction/building marketplace terminology.
No brands unless the brand is explicitly present in the input. Do not invent brands.
Avoid overly broad aliases unless they are useful search terms for this exact product.
Limit direct aliases to 5-12 terms. Separate direct aliases from broader related terms.
Use cases must be search-relevant phrases only when users would naturally search by the job/use case.
Do not force use cases. A door may have no useful use cases. A saw can have use cases like "kapa metall".
Prefer lowercase. Do not include duplicates.

Field rules:
- searchAliases: direct alternate names, category-specific terms, close product synonyms.
- searchRelatedTerms: broader related product terms that can still be relevant.
- searchUseCases: practical search intents, only when they genuinely help search.

Product title: ${input.title}
Description: ${input.description ?? 'Saknas'}
Category: ${[input.parentCategoryName, input.categoryName].filter(Boolean).join(' > ') || 'Saknas'}
Category aliases: ${(input.categorySearchAliases ?? []).join(', ') || 'Saknas'}
Brand: ${input.brandName ?? 'Saknas'}
`,
      });

      return {
        searchAliases: this.sanitizeTerms([
          ...output.searchAliases,
          ...fallbackTerms,
        ]).slice(0, MAX_DIRECT_ALIASES),
        searchRelatedTerms: this.sanitizeTerms(output.searchRelatedTerms).slice(
          0,
          MAX_RELATED_TERMS,
        ),
        searchUseCases: this.sanitizeTerms(output.searchUseCases).slice(
          0,
          MAX_USE_CASES,
        ),
      };
    } catch (error) {
      this.logger.warn('Product search enrichment generation failed', {
        title: input.title,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        searchAliases: fallbackTerms.slice(0, MAX_DIRECT_ALIASES),
        searchRelatedTerms: [],
        searchUseCases: [],
      };
    }
  }

  buildProductSearchDocument(input: ProductSearchDocumentInput) {
    return this.sanitizeTerms([
      input.title,
      input.description,
      input.categoryName,
      input.parentCategoryName,
      input.brandName,
      ...(input.categorySearchAliases ?? []),
      ...input.searchAliases,
      ...input.searchRelatedTerms,
      ...input.searchUseCases,
    ]).join(' ');
  }

  sanitizeTerms(terms: (string | null | undefined)[]) {
    const normalizedTerms = terms
      .flatMap((term) => `${term ?? ''}`.split(','))
      .map((term) =>
        term
          .toLocaleLowerCase('sv-SE')
          .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
          .replace(/\s+/g, ' ')
          .trim(),
      )
      .filter((term) => term.length >= 2);

    return [...new Set(normalizedTerms)];
  }

  private createFallbackTerms(terms: (string | null | undefined)[]) {
    const stopWords = new Set([
      'att',
      'den',
      'det',
      'eller',
      'ett',
      'för',
      'med',
      'och',
      'på',
      'som',
      'till',
    ]);
    const baseTerms = this.sanitizeTerms(terms)
      .flatMap((term) => term.split(' '))
      .filter((term) => term.length >= 3 && !stopWords.has(term));

    return this.sanitizeTerms(
      baseTerms.flatMap((term) => [term, ...this.stemSearchTerm(term)]),
    );
  }

  private stemSearchTerm(term: string) {
    if (term.length < 5) return [];

    if (/(arna|erna|orna)$/.test(term)) return [term.slice(0, -4)];
    if (/(ar|er|or)$/.test(term)) return [term.slice(0, -2)];
    if (/(en|et)$/.test(term)) return [term.slice(0, -2)];
    if (/r$/.test(term)) return [term.slice(0, -1)];

    return [];
  }
}
