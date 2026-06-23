import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';
import { Logger } from 'winston';

import { Brand } from 'src/entities/brand.entity';
import { Category } from 'src/entities/category.entity';
import { Product } from 'src/entities/product.entity';
import { SearchEnrichmentService } from 'src/services/search-enrichment.service';

const PRODUCT_BATCH_SIZE = 10;
const MAX_GENERATION_ATTEMPTS = 5;
const RETRY_DELAYS_MS = [5000, 15000, 45000, 120000];

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
export class SearchEnrichmentBackfillService {
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
    private searchEnrichmentService: SearchEnrichmentService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

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
            this.searchEnrichmentService.generateCategoryAliasesOrThrow({
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
              this.searchEnrichmentService.generateProductSearchEnrichmentOrThrow(
                {
                  title: product.title,
                  description: product.description,
                  categoryName: product.category?.name,
                  parentCategoryName: product.category?.parent?.name,
                  categorySearchAliases: product.category?.searchAliases,
                  brandName: brand?.name,
                },
              ),
          );

          product.searchAliases = this.searchEnrichmentService.sanitizeTerms(
            product.searchAliases?.length
              ? product.searchAliases
              : generated.searchAliases,
          );
          product.searchRelatedTerms =
            this.searchEnrichmentService.sanitizeTerms(
              product.searchRelatedTerms?.length
                ? product.searchRelatedTerms
                : generated.searchRelatedTerms,
            );
          product.searchUseCases = this.searchEnrichmentService.sanitizeTerms(
            product.searchUseCases?.length
              ? product.searchUseCases
              : generated.searchUseCases,
          );
          product.searchDocument =
            this.searchEnrichmentService.buildProductSearchDocument({
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
}
