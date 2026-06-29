import {
  GoogleGenAI,
  Part,
  PartMediaResolutionLevel,
  ThinkingLevel,
} from '@google/genai';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ColorTypeEnum,
  MeasurementUnitEnum,
  Product,
  ProductConditionEnum,
  ProductStatus,
  ProductVisibilityEnum,
} from 'src/entities/product.entity';
import { Category } from 'src/entities/category.entity';
import { BadUserInputException, InternalServerException } from 'src/exceptions';
import { AnalyzeProductImagesInput } from 'src/resolvers/product.resolver';
import { Not, IsNull, Repository } from 'typeorm';
import { FileService } from './file.service';
import { QuantityUnitEnum, FileSourceEnum } from 'src/constants/enums';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { BrandService } from './brand.service';
import { File } from 'src/entities/file.entity';
import { OrganizationService } from './organization.service';

const IMAGE_FETCH_TIMEOUT_MS = 10_000;
const GEMINI_TIMEOUT_MS = 60_000;
const GEMINI_RETRY_DELAY_MS = 1_500;
const LEAF_CATEGORIES_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class AIService {
  private gemini: GoogleGenAI;
  //categories change a few times a year via CMS — a TTL bounds staleness
  //without coupling this service to category writes
  private leafCategoriesCache: {
    categories: Category[];
    categoryList: string;
    fetchedAt: number;
  } | null = null;

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private fileService: FileService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private brandService: BrandService,
    private organizationService: OrganizationService,
  ) {
    this.gemini = new GoogleGenAI({});
  }

  async analyzeProductImages(
    input: AnalyzeProductImagesInput,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: input.productId },
      relations: { images: true },
    });
    if (!product) {
      throw BadUserInputException();
    }
    const images = product.images;
    if (!images || images.length === 0) {
      throw BadUserInputException();
    }

    const quantities = Object.keys(QuantityUnitEnum);

    const { categories: leafCategories, categoryList } =
      await this.getLeafCategories();

    // Fetch images from S3 and convert to base64
    const imageFetchStart = Date.now();
    let imageParts: Part[];
    try {
      imageParts = await Promise.all(
        product.images.map(async (image) => {
          const imageUrl = await this.fileService.getUrl(image);
          const imageResponse = await fetch(imageUrl, {
            signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
          });
          if (!imageResponse.ok) {
            throw new Error(
              `S3 returned ${imageResponse.status} for image ${image.id}`,
            );
          }
          const arrayBuffer = await imageResponse.arrayBuffer();
          const imageBase64 = Buffer.from(arrayBuffer).toString('base64');
          return {
            inlineData: {
              data: imageBase64,
              mimeType: image.mimeType || 'image/jpeg',
            },
            //MEDIUM is enough: the app downscales uploads to ~800px width, so
            //HIGH only spends extra image tokens (= latency) on upscaled pixels
            mediaResolution: {
              level: PartMediaResolutionLevel.MEDIA_RESOLUTION_MEDIUM,
            },
          };
        }),
      );
    } catch (e) {
      this.logger.error('Failed to fetch product images from S3', {
        error: e instanceof Error ? e.message : e,
        productId: product.id,
        imageCount: product.images.length,
      });
      throw InternalServerException('Failed to fetch product images');
    }
    this.logger.info('AI analysis: images fetched', {
      productId: product.id,
      imageCount: product.images.length,
      durationMs: Date.now() - imageFetchStart,
    });

    // Call Gemini API with retry for transient failures
    const geminiRequest = {
      model: 'gemini-3-flash-preview',
      config: {
        responseMimeType: 'application/json' as const,
        //Gemini 3 thinks dynamically by default, which can add seconds; this
        //task (structured extraction) doesn't need deep reasoning
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
      contents: [
        {
          parts: [
            ...imageParts,
            {
              text: `
              You are an assistant helping to create listings for RebuildR, a Swedish
              marketplace for reclaimed building materials. You are provided with ${product.images.length} image
              ${product.images.length > 1 ? 's' : ''} of the same product. Analyze all images together and return
              ONLY a valid JSON object — no markdown, no backticks, no preamble.

              "title": "Short, descriptive product title in Swedish (max 8 words)",
              "description": "Product description in Swedish. Max 60 words. Write factual statements,
              not guesses. State what the product is, its likely use, and its visible condition
              directly — as if you know. Do not use hedging phrases like 'appears to be', 'seems like',
              'looks like', or 'ser ut att vara'. No marketing fluff.",
              "additionalInfo": "Bra att veta — visible defects, wear, missing parts, or other caveats the
              buyer must know. In Swedish. Max 30 words. IMPORTANT: For used products (Bruksskick or
              Funktionellt skick), always describe the most notable wear or defect visible — do NOT
              return null. Only return null for products in Originalskick or Nyskick with no visible
              issues.",
              "brand": "Manufacturer/brand name if visible on the product. If uncertain or not
              visible, return 'Okänt'.",
              "condition": "Classify the product condition using EXACTLY one of these five levels.
              Read the definitions carefully and apply them strictly — when in doubt, choose the lower
              level:
              ${ProductConditionEnum.NEW}: Brand new and unused in original packaging, price tag still attached.
              Reserve this only for factory-sealed products.
              ${ProductConditionEnum.VERY_GOOD}: Unused product without original packaging or price tag. No visible wear,
              scratches or marks whatsoever. Looks brand new in practice.
              ${ProductConditionEnum.GOOD}: Used product with minor wear that does NOT affect function or durability.
              May include older products with natural patina. Surface marks, light scratches or small
              cosmetic imperfections are acceptable — but function is fully intact.
              ${ProductConditionEnum.OKAY}: Clearly used product with visible wear. Fully functional. Signs of age,
              use, or simple repairs may be present. Paint loss, rust spots, dents or staining that do
              not affect function.
              ${ProductConditionEnum.BAD}: Heavily used product with significant wear, but still usable. May
              require service, adjustment or renovation for optimal function. This is the lowest
              acceptable condition for sale — major surface damage, heavy rust, structural wear or
              missing minor parts are all indicators.
              IMPORTANT CALIBRATION: Most reclaimed building materials fall in the ${ProductConditionEnum.OKAY} or
              ${ProductConditionEnum.BAD} range. A product must genuinely look unused to qualify for ${ProductConditionEnum.VERY_GOOD} or
              above. Heavy rust, flaking paint, deep scratches or severe patina = ${ProductConditionEnum.BAD}.
              Do not over-rate condition.",
              "primaryQuantification": "Primary quantification. Determine which of the following quantity units (${quantities}) best applies to the product/products on the image and what quantity (expressed as integer) of that unit are visible. Format the value as QUANTITY,QUANTITY ENUM.
              Always count the actual items.
              For pipes/rods/beams: use ${QuantityUnitEnum.AMOUNT} for individual piece count.",
              "secondaryQuantification": "Secondary quantification — use when the product naturally has two
              complementary measures that both add value for the buyer. Best matching unit from (${quantities}).
              Ask: does this product have both a COUNT and a COVERAGE/LENGTH/VOLUME? If yes, fill in secondaryQuantification. The primary quantification
              uses the most natural selling unit. The secondary quantification captures the complementary
              dimension. Examples by principle: count + length → pipes, rods, beams, cables, gutters
              (e.g. 120 pipes, each 6m = secondary 720,M); count + area → sheets, boards, tiles, panels
              sold per piece but covering area (e.g. 40 plasterboard sheets = secondary 52,M2); length
              + area → timber/planks sold per metre but also described in m2 (e.g. 80,M secondary
              16,M2); area + count → flooring/tiles sold per m2 but buyer wants to know number of
              pieces (e.g. 24,M2 secondary 96,ST); weight + volume → bulk materials like sand, gravel
              (e.g. 4,SACKAR secondary 200,KG); litres + tins → paint (e.g. 10,LITER secondary
              2,BURKAR). If neither dimension adds meaningful information beyond the primary, return
              null. QUANTITY must be expressed as an integer. Format: QUANTITY,QUANTITY ENUM",
              "dimensions": "Object containing any of the keys (height, width, length, thickness and diameter).
              Populate with only the relevant fields for this product type.
              The values should be presented as "value,unit" where value is an integer.
              Unit is always ${MeasurementUnitEnum.MM} except if the product is a door or a window in which case use ${MeasurementUnitEnum.DM}.
              Only use keys that make sense.
              Example:
              {
                height: "1,${MeasurementUnitEnum.MM}",
                width: "2,${MeasurementUnitEnum.MM}"
              },
              "weight": "Estimated weight of the product in kg as an integer. If impossible to estimate, return null.",
              "color": "ONLY if the product has a painted, coated or color-significant surface where color is relevant — such as painted
              panels, tiles, metal sheets, doors, windows, radiators, plasterboard. If color is
              irrelevant for this product type, return null.",
              "categoryId": "The id of the single best-matching category for this product, chosen
              from the category list below. Return EXACTLY the id string (a UUID) from the list —
              never invent an id, never return a name. If no category in the list is a reasonable
              match, return null.
              CATEGORY LIST (id | parent > name):
              ${categoryList}",
              "priceSuggestionMin": "Lower bound of a realistic asking-price range in SEK (integer)
              for this product on the Swedish second-hand market for reclaimed building materials,
              given its type, condition and quantity. The range covers the TOTAL listed quantity,
              not per unit. Be conservative — second-hand building materials typically sell for
              20-50% of new price. If you cannot make a meaningful estimate, return null.",
              "priceSuggestionMax": "Upper bound of the same realistic asking-price range in SEK
              (integer). Must be >= priceSuggestionMin. If you cannot make a meaningful estimate,
              return null.",
              }
              `,
            },
          ],
        },
      ],
    };

    let result: string | undefined;
    const geminiStart = Date.now();
    try {
      const response = await this.callGeminiWithRetry(geminiRequest);
      result = response.text;
      this.logger.info('AI analysis: Gemini responded', {
        productId: product.id,
        imageCount: product.images.length,
        durationMs: Date.now() - geminiStart,
      });
    } catch (e) {
      this.logger.error('Gemini API call failed', {
        error: e instanceof Error ? e.message : e,
        productId: product.id,
        imageCount: product.images.length,
      });
      throw InternalServerException('AI service is temporarily unavailable');
    }

    if (!result) {
      this.logger.error('Gemini returned empty response', {
        productId: product.id,
        imageCount: product.images.length,
      });
      throw InternalServerException('AI returned an empty response');
    }

    // Parse JSON response
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(result);
    } catch (e) {
      this.logger.error('Failed to parse Gemini JSON response', {
        error: e instanceof Error ? e.message : e,
        productId: product.id,
        rawResponse: result.substring(0, 500),
      });
      throw InternalServerException('AI returned an invalid response');
    }

    const {
      title,
      description,
      additionalInfo,
      primaryQuantification,
      secondaryQuantification,
      dimensions,
      weight,
      color,
      condition,
      brand,
      categoryId,
      priceSuggestionMin,
      priceSuggestionMax,
    } = parsed;

    // Assign text fields
    product.title = title as string;
    product.description = description as string;
    product.additionalInfo = additionalInfo as string;

    // Category suggestion — only accept ids that exist in the leaf list we
    // sent (guards against hallucinated ids; mirrors the publish-time check
    // that a product category must be a child category).
    if (categoryId && typeof categoryId === 'string') {
      const matched = leafCategories.find((c) => c.id === categoryId.trim());
      if (matched) {
        //set the id only — assigning the long-lived cached entity to a product
        //that is then save()d would let TypeORM cascade into the shared cache
        product.categoryId = matched.id;
      } else {
        this.logger.warn('Invalid categoryId from Gemini, skipping', {
          productId: product.id,
          categoryId,
        });
      }
    }

    // Price suggestion — never applied to price itself, stored separately and
    // shown to the seller as a hint.
    const parseSek = (value: unknown): number | null => {
      const n = typeof value === 'string' ? parseInt(value, 10) : Number(value);
      return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
    };
    const suggestionMin = parseSek(priceSuggestionMin);
    const suggestionMax = parseSek(priceSuggestionMax);
    if (suggestionMin !== null && suggestionMax !== null) {
      product.priceSuggestionMin = Math.min(suggestionMin, suggestionMax);
      product.priceSuggestionMax = Math.max(suggestionMin, suggestionMax);
    } else {
      product.priceSuggestionMin = null;
      product.priceSuggestionMax = null;
    }

    // Parse primary quantification
    if (
      primaryQuantification &&
      typeof primaryQuantification === 'string' &&
      primaryQuantification.includes(',')
    ) {
      const [primaryQuantity, primaryUnit] = primaryQuantification.split(',');
      if (primaryUnit?.trim() in QuantityUnitEnum) {
        product.primaryQuantity = Math.round(Number(primaryQuantity));
        product.primaryUnit = primaryUnit.trim() as QuantityUnitEnum;
      } else {
        this.logger.warn('Invalid primaryUnit from Gemini, skipping', {
          productId: product.id,
          primaryQuantification,
        });
      }
    }

    // Parse secondary quantification
    if (
      secondaryQuantification &&
      typeof secondaryQuantification === 'string' &&
      secondaryQuantification.includes(',')
    ) {
      const [secondaryQuantity, secondaryUnit] =
        secondaryQuantification.split(',');
      if (secondaryUnit?.trim() in QuantityUnitEnum) {
        product.secondaryQuantity = Math.round(Number(secondaryQuantity));
        product.secondaryUnit = secondaryUnit.trim() as QuantityUnitEnum;
      } else {
        this.logger.warn('Invalid secondaryUnit from Gemini, skipping', {
          productId: product.id,
          secondaryQuantification,
        });
      }
    }

    // Set measurements
    if (dimensions && typeof dimensions === 'object') {
      const validKeys = ['height', 'width', 'length', 'thickness', 'diameter'];
      for (const key of Object.keys(dimensions as Record<string, unknown>)) {
        if (!validKeys.includes(key)) continue;
        const dimValue = (dimensions as Record<string, unknown>)[key];
        if (typeof dimValue !== 'string' || !dimValue.includes(',')) {
          this.logger.warn('Invalid dimension value from Gemini, skipping', {
            productId: product.id,
            key,
            value: dimValue,
          });
          continue;
        }
        const [value, unit] = dimValue.split(',');
        product[key] = parseInt(value);
        product[key + 'Unit'] = unit.trim();
      }
    }

    product.weight = weight as number;
    product.weightUnit = MeasurementUnitEnum.KG;

    product.color = color as string;
    product.colorType = ColorTypeEnum.FREE_TEXT;

    // Validate condition enum
    const validConditions = Object.values(ProductConditionEnum);
    if (
      condition &&
      validConditions.includes(condition as ProductConditionEnum)
    ) {
      product.condition = condition as ProductConditionEnum;
    } else if (condition) {
      this.logger.warn('Invalid condition from Gemini, skipping', {
        productId: product.id,
        condition,
      });
    }

    // Brand
    if (brand && typeof brand === 'string') {
      try {
        const dbBrand = await this.brandService.findBrandByName(brand);
        if (dbBrand) {
          product.brand = dbBrand;
        } else {
          product.brand = await this.brandService.createBrand({
            name: brand,
            categoryId: product.categoryId,
          });
        }
      } catch (e) {
        this.logger.error('Failed to attach brand to product', {
          error: e instanceof Error ? e.message : e,
          productId: product.id,
          brand,
        });
      }
    }

    // Save product
    try {
      return await this.productRepository.save(product);
    } catch (e) {
      this.logger.error('Failed to save product after AI analysis', {
        error: e instanceof Error ? e.message : e,
        productId: product.id,
      });
      throw InternalServerException('Failed to save product');
    }
  }

  /**
   * In-app AI import without S3: analyse a pasted/uploaded product list (CSV /
   * spreadsheet rows / free text) into internal Products with generated
   * catalogue images. Owned by the seller's company.
   */
  async analyzeInventoryFromText(
    text: string,
    sellerId: string,
  ): Promise<Product[]> {
    if (!text?.trim()) {
      throw BadUserInputException('No text provided');
    }
    const parts: Part[] = [{ text } as Part];
    return this.runInventoryAnalysisOnParts(parts, sellerId, undefined, true);
  }

  /**
   * DEV/LOCAL ONLY: analyse images/PDFs read from the local filesystem (no S3),
   * creating internal Products owned by the given user/company. Lets us
   * exercise the real Gemini extraction locally without uploading to the shared
   * Spaces bucket. Use sparingly — each call hits the Gemini API.
   */
  async analyzeInventoryFromLocalFiles(
    filePaths: string[],
    sellerId: string,
  ): Promise<Product[]> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const mimeByExt: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };
    const parts: Part[] = await Promise.all(
      filePaths.map(async (p) => {
        const buffer = await fs.readFile(p);
        const ext = path.extname(p).toLowerCase();
        return {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: mimeByExt[ext] ?? 'image/jpeg',
          },
          mediaResolution: {
            level: PartMediaResolutionLevel.MEDIA_RESOLUTION_MEDIUM,
          },
        } as Part;
      }),
    );
    return this.runInventoryAnalysisOnParts(parts, sellerId, undefined, true);
  }

  /**
   * In-app AI import from photos (no S3): one photo -> one internal Product,
   * with the uploaded photo stored locally as the listing image. No image is
   * generated — the photo already is the image.
   */
  async analyzeInventoryFromImages(
    base64Images: string[],
    sellerId: string,
  ): Promise<Product[]> {
    if (!base64Images?.length) {
      throw BadUserInputException('No images provided');
    }
    const orgId = (
      await this.organizationService.getOrCreateUserOrganization(sellerId)
    ).id;

    const products: Product[] = [];
    for (const raw64 of base64Images) {
      const data = raw64.replace(/^data:[^,]+,/, '');
      const part: Part = {
        inlineData: { data, mimeType: 'image/jpeg' },
        mediaResolution: {
          level: PartMediaResolutionLevel.MEDIA_RESOLUTION_MEDIUM,
        },
      } as Part;
      // generateImages = false: we attach the uploaded photo instead.
      const created = await this.runInventoryAnalysisOnParts(
        [part],
        sellerId,
        orgId,
        false,
      );
      for (const product of created) {
        await this.saveLocalProductImage(product, data, 'image/jpeg');
      }
      products.push(...created);
    }
    return products;
  }

  // Core Gemini call + parse + persist for inventory analysis, shared by the
  // S3-backed import flow and the local-file dev path. Creates internal
  // Products owned by the seller's company.
  private async runInventoryAnalysisOnParts(
    fileParts: Part[],
    sellerId: string,
    organizationId?: string,
    generateImages = false,
  ): Promise<Product[]> {
    const orgId =
      organizationId ??
      (await this.organizationService.getOrCreateUserOrganization(sellerId)).id;
    const { categories: leafCategories, categoryList } =
      await this.getLeafCategories();
    const quantities = Object.keys(QuantityUnitEnum);

    const geminiRequest = {
      model: 'gemini-3-flash-preview',
      config: {
        responseMimeType: 'application/json' as const,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
      contents: [
        {
          parts: [
            ...fileParts,
            {
              text: `
              You are an assistant building a structured internal inventory ("internlager")
              for RebuildR, a Swedish marketplace for reclaimed building materials and tools.
              You are given source material describing materials/tools in an organization's
              stock — this may be photos, PDFs, OR a product list / spreadsheet rows / free
              text (columns such as Beskrivning, Märkning/dimensions, Godstyp, Material,
              Projekt, Lagerplats, CO2, Inleverans, etc.).

              Identify EACH distinct article and return ONLY a valid JSON object — no markdown,
              no backticks, no preamble — of the form: { "items": [ ... ] }. Create one array
              element per distinct article (different products = different items; a pallet with
              several product types yields several items). If the source lists many rows, return
              one item per row.

              Each item object has these fields (Swedish text values):
              "title": "Short descriptive title in Swedish (max 8 words)",
              "description": "Factual description in Swedish, max 60 words. No hedging.",
              "additionalInfo": "Visible defects/wear/caveats in Swedish, max 30 words, or null.",
              "brand": "Manufacturer/brand name if visible, else 'Okänt'.",
              "condition": "EXACTLY one of ${Object.values(ProductConditionEnum).join(', ')}. Most reclaimed materials are ${ProductConditionEnum.OKAY} or ${ProductConditionEnum.BAD}; do not over-rate.",
              "primaryQuantification": "QUANTITY,UNIT using one of (${quantities}). Count actual items. Integer quantity.",
              "secondaryQuantification": "QUANTITY,UNIT or null — complementary measure (e.g. count + length).",
              "dimensions": "Object with any of height,width,length,thickness,diameter as 'value,unit' (unit ${MeasurementUnitEnum.MM}, or ${MeasurementUnitEnum.DM} for doors/windows). Integers.",
              "weight": "Estimated weight in kg as integer, or null.",
              "color": "Color only if color-significant (painted/coated surfaces), else null.",
              "categoryId": "EXACTLY one id (UUID) from the list below, or null. Never invent ids.",
              "priceSuggestionMin": "Conservative total asking-price in SEK (integer) for the listed quantity, or null.",
              "priceSuggestionMax": "Upper bound in SEK (integer), >= min, or null.",

              CATEGORY LIST (id | parent > name):
              ${categoryList}
              `,
            },
          ],
        },
      ],
    };

    const response = await this.callGeminiWithRetry(geminiRequest);
    const result = response.text;
    if (!result) {
      throw new Error('AI returned an empty response');
    }

    const parsed = JSON.parse(result) as { items?: Record<string, unknown>[] };
    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
    if (rawItems.length === 0) {
      this.logger.warn('AI inventory analysis returned no items', { sellerId });
    }

    const products: Product[] = [];
    for (const raw of rawItems) {
      const product = await this.buildInternalProduct(
        raw,
        sellerId,
        orgId,
        leafCategories,
      );
      const saved = await this.productRepository.save(product);
      if (generateImages) {
        await this.generateProductImage(saved, raw);
      }
      products.push(saved);
    }
    return products;
  }

  /**
   * DEV/LOCAL: generate a clean catalog image for a product with Gemini and
   * store it on local disk (served via /generated, no S3). Best-effort — a
   * failure leaves the product imageless rather than failing the import.
   */
  private async generateProductImage(
    product: Product,
    raw: Record<string, unknown>,
  ): Promise<void> {
    try {
      const categoryName =
        typeof raw.category === 'string' ? raw.category : '';
      const prompt = `A clean, well-lit product catalogue photograph of a single second-hand building material/tool for a Swedish reclaimed-materials marketplace. Plain neutral light-grey background, centered, no text, no watermark, realistic.
Item: ${product.title}.
${product.description ?? ''}
${categoryName ? `Category: ${categoryName}.` : ''}
Condition: used/reclaimed (${product.condition}).`;

      const response = await this.callGeminiWithRetry({
        model: 'gemini-2.5-flash-image',
        contents: prompt,
      });

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const imagePart = parts.find((p) => p.inlineData?.data);
      if (!imagePart?.inlineData?.data) {
        throw new Error('Gemini returned no image');
      }
      await this.saveLocalProductImage(
        product,
        imagePart.inlineData.data,
        'image/png',
      );
    } catch (e) {
      this.logger.warn('Failed to generate product image', {
        productId: product.id,
        error: e instanceof Error ? e.message : e,
      });
    }
  }

  // Store a base64 image on local disk (served via /generated, no S3) and
  // attach it as the product's image. Shared by AI image generation and the
  // photo-import path (where the uploaded photo is the image).
  private async saveLocalProductImage(
    product: Product,
    base64Data: string,
    mimeType: string,
  ): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const dir = path.join(process.cwd(), 'generated-images');
    await fs.mkdir(dir, { recursive: true });
    const ext = (mimeType.split('/')[1] || 'png').replace('jpeg', 'jpg');
    const file = await this.fileRepository.save(
      this.fileRepository.create({ mimeType, source: FileSourceEnum.ADMIN }),
    );
    await fs.writeFile(
      path.join(dir, `${file.id}.${ext}`),
      new Uint8Array(Buffer.from(base64Data, 'base64')),
    );
    file.externalUrl = `http://localhost:3000/generated/${file.id}.${ext}`;
    file.productImage = product;
    await this.fileRepository.save(file);
  }

  // Map one parsed AI object to a (not yet saved) internal Product entity.
  private async buildInternalProduct(
    raw: Record<string, unknown>,
    sellerId: string,
    organizationId: string,
    leafCategories: Category[],
  ): Promise<Product> {
    const product = this.productRepository.create({
      sellerId,
      organizationId,
      visibility: ProductVisibilityEnum.INTERNAL,
      status: ProductStatus.PUBLISHED,
    });

    product.title = (raw.title as string) || 'Namnlös vara';
    product.description = (raw.description as string) ?? undefined;
    product.additionalInfo = (raw.additionalInfo as string) ?? undefined;
    product.color = (raw.color as string) ?? undefined;
    product.colorType = ColorTypeEnum.FREE_TEXT;
    if (typeof raw.weight === 'number') {
      product.weight = raw.weight;
      product.weightUnit = MeasurementUnitEnum.KG;
    }

    // category — only accept ids present in the leaf list
    if (raw.categoryId && typeof raw.categoryId === 'string') {
      const matched = leafCategories.find(
        (c) => c.id === (raw.categoryId as string).trim(),
      );
      if (matched) product.categoryId = matched.id;
    }

    // condition
    const condition = raw.condition as ProductConditionEnum;
    if (Object.values(ProductConditionEnum).includes(condition)) {
      product.condition = condition;
    }

    // brand — link if it already exists; do not auto-create during bulk import
    if (raw.brand && typeof raw.brand === 'string' && raw.brand !== 'Okänt') {
      const brand = await this.brandService.findBrandByName(raw.brand);
      if (brand) product.brandId = brand.id;
    }

    // quantities
    const primary = this.parseQuantification(raw.primaryQuantification);
    if (primary) {
      product.primaryQuantity = primary.quantity;
      product.primaryUnit = primary.unit;
    }
    const secondary = this.parseQuantification(raw.secondaryQuantification);
    if (secondary) {
      product.secondaryQuantity = secondary.quantity;
      product.secondaryUnit = secondary.unit;
    }

    // dimensions — per-dimension value + unit on Product
    if (raw.dimensions && typeof raw.dimensions === 'object') {
      const dims = raw.dimensions as Record<string, unknown>;
      const validKeys = ['height', 'width', 'length', 'thickness', 'diameter'];
      for (const key of validKeys) {
        const value = dims[key];
        if (typeof value !== 'string' || !value.includes(',')) continue;
        const [v, u] = value.split(',');
        const n = parseInt(v, 10);
        if (Number.isFinite(n)) product[key] = n;
        const unit = u?.trim() as MeasurementUnitEnum;
        if (Object.values(MeasurementUnitEnum).includes(unit)) {
          product[key + 'Unit'] = unit;
        }
      }
    }

    // price — AI suggestion is a starting point; stored as hints too. Product
    // price is in öre (the resolver divides by 100).
    const min = this.parseSekValue(raw.priceSuggestionMin);
    const max = this.parseSekValue(raw.priceSuggestionMax);
    if (min !== null && max !== null) {
      product.priceSuggestionMin = Math.min(min, max);
      product.priceSuggestionMax = Math.max(min, max);
    }
    product.price = (min ?? 0) * 100;
    product.isGiveaway = product.price <= 0;

    return product;
  }

  private parseQuantification(
    value: unknown,
  ): { quantity: number; unit: QuantityUnitEnum } | null {
    if (typeof value !== 'string' || !value.includes(',')) return null;
    const [q, u] = value.split(',');
    const unit = u?.trim() as QuantityUnitEnum;
    const quantity = Math.round(Number(q));
    if (!Object.values(QuantityUnitEnum).includes(unit)) return null;
    if (!Number.isFinite(quantity)) return null;
    return { quantity, unit };
  }

  private parseSekValue(value: unknown): number | null {
    const n = typeof value === 'string' ? parseInt(value, 10) : Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
  }

  // Leaf categories (with parent names) injected into the prompt so the
  // model can suggest a category. Only child categories are valid targets —
  // publishing requires a category with a parentId. Cached: the list is
  // ~16k chars rebuilt from a DB query otherwise repeated on every analysis.
  private async getLeafCategories() {
    const now = Date.now();
    if (
      this.leafCategoriesCache &&
      now - this.leafCategoriesCache.fetchedAt < LEAF_CATEGORIES_TTL_MS
    ) {
      return this.leafCategoriesCache;
    }
    const categories = await this.categoryRepository.find({
      where: { parentId: Not(IsNull()) },
      relations: { parent: true },
    });
    const categoryList = categories
      .map((c) => `${c.id} | ${c.parent?.name ?? ''} > ${c.name}`)
      .join('\n');
    this.leafCategoriesCache = { categories, categoryList, fetchedAt: now };
    return this.leafCategoriesCache;
  }

  private async callGeminiWithRetry(
    request: Parameters<GoogleGenAI['models']['generateContent']>[0],
    retries = 1,
  ) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.gemini.models.generateContent({
          ...request,
          config: {
            ...request.config,
            httpOptions: { timeout: GEMINI_TIMEOUT_MS },
          },
        });
      } catch (e) {
        const isLastAttempt = attempt === retries;
        const isRetryable =
          e instanceof Error &&
          /5\d\d|timeout|ECONNRESET|ETIMEDOUT|rate/i.test(e.message);

        if (isLastAttempt || !isRetryable) {
          throw e;
        }

        this.logger.warn('Gemini API call failed, retrying', {
          attempt: attempt + 1,
          error: e instanceof Error ? e.message : e,
        });
        await new Promise((resolve) =>
          setTimeout(resolve, GEMINI_RETRY_DELAY_MS),
        );
      }
    }
    throw new Error('Gemini retry loop exited unexpectedly');
  }
}
