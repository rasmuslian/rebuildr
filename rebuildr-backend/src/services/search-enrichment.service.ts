import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { generateText, Output } from 'ai';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';
import { z } from 'zod';
import { Logger } from 'winston';

import { Brand } from 'src/entities/brand.entity';
import { Category } from 'src/entities/category.entity';
import { Product } from 'src/entities/product.entity';

interface ProductSearchContext {
  title: string;
  description?: string | null;
  categoryName?: string | null;
  parentCategoryName?: string | null;
  categorySearchAliases?: string[] | null;
  brandName?: string | null;
}

interface ProductSearchEnrichment {
  searchAliases: string[];
  searchRelatedTerms: string[];
  searchUseCases: string[];
}

type ProductSearchDocumentInput = ProductSearchContext &
  ProductSearchEnrichment;

const MAX_DIRECT_ALIASES = 12;
const MAX_RELATED_TERMS = 10;
const MAX_USE_CASES = 8;
const SEARCH_ENRICHMENT_TIMEOUT_MS = 15000;
const PRODUCT_BATCH_SIZE = 10;
const MAX_GENERATION_ATTEMPTS = 5;
const RETRY_DELAYS_MS = [5000, 15000, 45000, 120000];

class SearchEnrichmentTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Search enrichment generation timed out after ${timeoutMs}ms`);
    this.name = 'SearchEnrichmentTimeoutError';
  }
}

const categoryAliasSchema = z.object({
  aliases: z.array(z.string()).max(MAX_DIRECT_ALIASES),
});

const productSearchEnrichmentSchema = z.object({
  searchAliases: z.array(z.string()).max(MAX_DIRECT_ALIASES),
  searchRelatedTerms: z.array(z.string()).max(MAX_RELATED_TERMS),
  searchUseCases: z.array(z.string()).max(MAX_USE_CASES),
});

interface SearchEnrichmentOptions {
  allowFallback?: boolean;
}

type BackfillState = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';

interface SearchEnrichmentBackfillStatus {
  state: BackfillState;
  startedAt?: Date;
  finishedAt?: Date;
  enrichedCategories: number;
  enrichedProducts: number;
  failedCategories: number;
  failedProducts: number;
  remainingCategories: number;
  remainingProducts: number;
  currentItemType?: string;
  currentItemId?: string;
  currentItemName?: string;
  currentAttempt?: number;
  lastProgressAt?: Date;
  lastError?: string;
}

@Injectable()
export class SearchEnrichmentService {
  private google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  private isRunning = false;
  private status: SearchEnrichmentBackfillStatus = {
    state: 'IDLE',
    enrichedCategories: 0,
    enrichedProducts: 0,
    failedCategories: 0,
    failedProducts: 0,
    remainingCategories: 0,
    remainingProducts: 0,
  };

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async generateCategoryAliases(input: {
    name: string;
    description?: string | null;
    parentName?: string | null;
  }): Promise<string[]> {
    return this.generateCategoryAliasesInternal(input, { allowFallback: true });
  }

  async generateCategoryAliasesOrThrow(input: {
    name: string;
    description?: string | null;
    parentName?: string | null;
  }): Promise<string[]> {
    return this.generateCategoryAliasesInternal(input, {
      allowFallback: false,
    });
  }

  async generateProductSearchEnrichment(
    input: ProductSearchContext,
  ): Promise<ProductSearchEnrichment> {
    return this.generateProductSearchEnrichmentInternal(input, {
      allowFallback: true,
    });
  }

  async generateProductSearchEnrichmentOrThrow(
    input: ProductSearchContext,
  ): Promise<ProductSearchEnrichment> {
    return this.generateProductSearchEnrichmentInternal(input, {
      allowFallback: false,
    });
  }

  async startBackfill() {
    if (this.isRunning) {
      this.logger.info('Search enrichment backfill already running');
      return this.status;
    }

    const [remainingCategories, remainingProducts] = await Promise.all([
      this.countCategoriesMissingSearchMetadata(),
      this.countProductsMissingSearchMetadata(),
    ]);

    this.status = {
      state: 'RUNNING',
      startedAt: new Date(),
      finishedAt: undefined,
      enrichedCategories: 0,
      enrichedProducts: 0,
      failedCategories: 0,
      failedProducts: 0,
      remainingCategories,
      remainingProducts,
      currentItemType: undefined,
      currentItemId: undefined,
      currentItemName: undefined,
      currentAttempt: undefined,
      lastProgressAt: new Date(),
      lastError: undefined,
    };
    this.isRunning = true;
    this.logger.info('Search enrichment backfill started', {
      remainingCategories,
      remainingProducts,
    });
    void this.runBackfill();

    return this.status;
  }

  async getStatus() {
    if (this.status.state === 'RUNNING') {
      await this.refreshRemainingCounts();
    }

    return this.status;
  }

  private async generateCategoryAliasesInternal(
    input: {
      name: string;
      description?: string | null;
      parentName?: string | null;
    },
    options: SearchEnrichmentOptions,
  ): Promise<string[]> {
    const fallbackAliases = this.createFallbackTerms([
      input.name,
      input.description,
      input.parentName,
    ]);

    try {
      const { output } = await this.withTimeout(
        (abortSignal) =>
          generateText({
            model: this.google('gemini-3.5-flash'),
            abortSignal,
            output: Output.object({
              schema: categoryAliasSchema,
            }),
            prompt: `
You generate Swedish search term aliases for RebuildR, a marketplace for reclaimed building materials.
The goal is to help users find this product when they search for related terms.

Return strict JSON matching the schema. Swedish terms only. Use construction/building marketplace terminology.
Generate 5-12 useful aliases that help users find this category when they search related product terms.
Do not include brands. Do not include overly broad terms unless they are genuinely useful for this category.
Do not include duplicate terms. Prefer lowercase.

Category: ${input.name}
Parent category: ${input.parentName ?? 'Saknas'}
Description: ${input.description ?? 'Saknas'}
`,
          }),
        SEARCH_ENRICHMENT_TIMEOUT_MS,
      );

      return this.sanitizeTerms(
        options.allowFallback
          ? [...output.aliases, ...fallbackAliases]
          : output.aliases,
      ).slice(0, MAX_DIRECT_ALIASES);
    } catch (error) {
      this.logger.warn('Category search alias generation failed', {
        categoryName: input.name,
        error: error instanceof Error ? error.message : String(error),
      });

      if (!options.allowFallback) {
        throw error;
      }

      return fallbackAliases.slice(0, MAX_DIRECT_ALIASES);
    }
  }

  private async generateProductSearchEnrichmentInternal(
    input: ProductSearchContext,
    options: SearchEnrichmentOptions,
  ): Promise<ProductSearchEnrichment> {
    const fallbackTerms = this.createFallbackTerms([
      input.title,
      input.description,
      input.categoryName,
      input.parentCategoryName,
      ...(input.categorySearchAliases ?? []),
    ]);

    try {
      const { output } = await this.withTimeout(
        (abortSignal) =>
          generateText({
            model: this.google('gemini-3.5-flash'),
            abortSignal,
            output: Output.object({
              schema: productSearchEnrichmentSchema,
            }),
            prompt: `
You generate Swedish search term aliases/related terms/use cases for RebuildR, a marketplace for reclaimed building materials.
The goal is to help users find this product when they search for related terms.

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
          }),
        SEARCH_ENRICHMENT_TIMEOUT_MS,
      );

      return {
        searchAliases: this.sanitizeTerms(
          options.allowFallback
            ? [...output.searchAliases, ...fallbackTerms]
            : output.searchAliases,
        ).slice(0, MAX_DIRECT_ALIASES),
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

      if (!options.allowFallback) {
        throw error;
      }

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

  private async runBackfill() {
    try {
      await this.backfillCategories();
      await this.backfillProducts();

      this.status = {
        ...this.status,
        state:
          this.status.failedCategories || this.status.failedProducts
            ? 'FAILED'
            : 'COMPLETED',
        finishedAt: new Date(),
      };

      this.logger.info('Search enrichment backfill completed', {
        enrichedCategories: this.status.enrichedCategories,
        enrichedProducts: this.status.enrichedProducts,
        failedCategories: this.status.failedCategories,
        failedProducts: this.status.failedProducts,
        remainingCategories: this.status.remainingCategories,
        remainingProducts: this.status.remainingProducts,
      });
    } catch (error) {
      this.status = {
        ...this.status,
        state: 'FAILED',
        finishedAt: new Date(),
        lastError: error instanceof Error ? error.message : String(error),
      };

      this.logger.error('Search enrichment backfill failed', {
        error: error instanceof Error ? error.message : String(error),
        enrichedCategories: this.status.enrichedCategories,
        enrichedProducts: this.status.enrichedProducts,
        failedCategories: this.status.failedCategories,
        failedProducts: this.status.failedProducts,
        remainingCategories: this.status.remainingCategories,
        remainingProducts: this.status.remainingProducts,
      });
    } finally {
      this.isRunning = false;
    }
  }

  private async backfillCategories() {
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .where(
        'cardinality(coalesce(category."searchAliases", ARRAY[]::text[])) = 0',
      )
      .orderBy('category.name', 'ASC')
      .getMany();

    for (const category of categories) {
      try {
        category.searchAliases = await this.withGenerationRetry(
          {
            itemType: 'category',
            itemId: category.id,
            itemName: category.name,
          },
          () =>
            this.generateCategoryAliasesOrThrow({
              name: category.name,
              description: category.description,
              parentName: category.parent?.name,
            }),
        );

        await this.categoryRepository.save(category);
        this.logger.info('Backfilled category search enrichment', {
          categoryId: category.id,
          categoryName: category.name,
        });
        this.status = {
          ...this.status,
          enrichedCategories: this.status.enrichedCategories + 1,
          remainingCategories: Math.max(this.status.remainingCategories - 1, 0),
          lastProgressAt: new Date(),
          lastError: undefined,
        };
      } catch (error) {
        this.status = {
          ...this.status,
          failedCategories: this.status.failedCategories + 1,
          lastError: error instanceof Error ? error.message : String(error),
        };
        this.logger.warn('Failed to backfill category search aliases', {
          categoryId: category.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  private async backfillProducts() {
    let cursor: { createdAt: Date; id: string } | null = null;

    while (true) {
      this.status = {
        ...this.status,
        currentItemType: 'product-batch',
        currentItemId: undefined,
        currentItemName: 'Loading next missing product batch',
        currentAttempt: undefined,
      };

      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .select(['product.id', 'product.createdAt'])
        .where(
          'cardinality(coalesce(product."searchAliases", ARRAY[]::text[])) = 0 OR product."searchDocument" IS NULL',
        )
        .orderBy('product.createdAt', 'ASC')
        .addOrderBy('product.id', 'ASC')
        .limit(PRODUCT_BATCH_SIZE);

      if (cursor) {
        queryBuilder.andWhere(
          '(product."createdAt" > :createdAt OR (product."createdAt" = :createdAt AND product.id > :id))',
          cursor,
        );
      }

      const productRefs = await queryBuilder.getMany();

      if (!productRefs.length) {
        return;
      }

      for (const productRef of productRefs) {
        cursor = { createdAt: productRef.createdAt, id: productRef.id };

        const product = await this.productRepository.findOne({
          where: { id: productRef.id },
          relations: { category: { parent: true } },
        });

        if (!product) {
          continue;
        }

        if (product.searchAliases?.length && product.searchDocument) {
          continue;
        }

        try {
          const brand = product.brandId
            ? await this.brandRepository.findOne({
                where: { id: product.brandId },
              })
            : null;
          const generated = await this.withGenerationRetry(
            {
              itemType: 'product',
              itemId: product.id,
              itemName: product.title,
            },
            () =>
              this.generateProductSearchEnrichmentOrThrow({
                title: product.title,
                description: product.description,
                categoryName: product.category?.name,
                parentCategoryName: product.category?.parent?.name,
                categorySearchAliases: product.category?.searchAliases,
                brandName: brand?.name,
              }),
          );

          product.searchAliases = this.sanitizeTerms(
            product.searchAliases?.length
              ? product.searchAliases
              : generated.searchAliases,
          );
          product.searchRelatedTerms = this.sanitizeTerms(
            product.searchRelatedTerms?.length
              ? product.searchRelatedTerms
              : generated.searchRelatedTerms,
          );
          product.searchUseCases = this.sanitizeTerms(
            product.searchUseCases?.length
              ? product.searchUseCases
              : generated.searchUseCases,
          );
          product.searchDocument = this.buildProductSearchDocument({
            title: product.title,
            description: product.description,
            categoryName: product.category?.name,
            parentCategoryName: product.category?.parent?.name,
            categorySearchAliases: product.category?.searchAliases,
            brandName: brand?.name,
            searchAliases: product.searchAliases,
            searchRelatedTerms: product.searchRelatedTerms,
            searchUseCases: product.searchUseCases,
          });

          await this.productRepository.save(product);
          this.logger.info('Backfilled product search enrichment', {
            productId: product.id,
            productTitle: product.title,
          });
          this.status = {
            ...this.status,
            enrichedProducts: this.status.enrichedProducts + 1,
            remainingProducts: Math.max(this.status.remainingProducts - 1, 0),
            lastProgressAt: new Date(),
            lastError: undefined,
          };
        } catch (error) {
          this.status = {
            ...this.status,
            failedProducts: this.status.failedProducts + 1,
            lastError: error instanceof Error ? error.message : String(error),
          };
          this.logger.warn('Failed to backfill product search enrichment', {
            productId: product.id,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }

  private async withGenerationRetry<T>(
    item: { itemType: string; itemId: string; itemName: string },
    operation: () => Promise<T>,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
      this.status = {
        ...this.status,
        currentItemType: item.itemType,
        currentItemId: item.itemId,
        currentItemName: item.itemName,
        currentAttempt: attempt,
      };
      this.logger.info('Generating search enrichment', {
        itemType: item.itemType,
        itemId: item.itemId,
        itemName: item.itemName,
        attempt,
      });

      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt >= MAX_GENERATION_ATTEMPTS) {
          break;
        }

        const delayMs = RETRY_DELAYS_MS[attempt - 1] ?? 10000;
        this.status = {
          ...this.status,
          currentItemType: item.itemType,
          currentItemId: item.itemId,
          currentItemName: item.itemName,
          currentAttempt: attempt,
          lastError: `LLM generation failed for ${item.itemType} ${item.itemId} (${item.itemName}) on attempt ${attempt}. Retrying in ${Math.round(delayMs / 1000)}s: ${error instanceof Error ? error.message : String(error)}`,
        };
        this.logger.warn('Search enrichment generation retry scheduled', {
          itemType: item.itemType,
          itemId: item.itemId,
          itemName: item.itemName,
          attempt,
          nextAttempt: attempt + 1,
          delayMs,
          error: error instanceof Error ? error.message : String(error),
        });
        await this.delay(delayMs);
      }
    }

    throw lastError;
  }

  private delay(delayMs: number) {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  private async refreshRemainingCounts() {
    const [remainingCategories, remainingProducts] = await Promise.all([
      this.countCategoriesMissingSearchMetadata(),
      this.countProductsMissingSearchMetadata(),
    ]);

    this.status = {
      ...this.status,
      remainingCategories,
      remainingProducts,
    };
  }

  private countCategoriesMissingSearchMetadata() {
    return this.categoryRepository
      .createQueryBuilder('category')
      .where(
        'cardinality(coalesce(category."searchAliases", ARRAY[]::text[])) = 0',
      )
      .getCount();
  }

  private countProductsMissingSearchMetadata() {
    return this.productRepository
      .createQueryBuilder('product')
      .where(
        'cardinality(coalesce(product."searchAliases", ARRAY[]::text[])) = 0 OR product."searchDocument" IS NULL',
      )
      .getCount();
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

  private async withTimeout<T>(
    operation: (abortSignal: AbortSignal) => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    const abortController = new AbortController();
    let timeout: NodeJS.Timeout;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        abortController.abort();
        reject(new SearchEnrichmentTimeoutError(timeoutMs));
      }, timeoutMs);
    });

    try {
      return await Promise.race([
        operation(abortController.signal),
        timeoutPromise,
      ]);
    } finally {
      clearTimeout(timeout);
    }
  }
}
