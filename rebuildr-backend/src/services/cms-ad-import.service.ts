import { GoogleGenAI, Part, ThinkingLevel } from '@google/genai';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as XLSX from 'xlsx';
import { QuantityUnitEnum } from 'src/constants/enums';
import { Category } from 'src/entities/category.entity';
import {
  CmsAdImportBatch,
  CmsAdImportBatchStatus,
} from 'src/entities/cms-ad-import-batch.entity';
import { File } from 'src/entities/file.entity';
import {
  ColorTypeEnum,
  MeasurementUnitEnum,
  Product,
  ProductConditionEnum,
  ProductStatus,
  ProductVisibility,
} from 'src/entities/product.entity';
import { ShippingPrice } from 'src/entities/shipping-price.entity';
import { User } from 'src/entities/user.entity';
import { BadUserInputException, NotFoundException } from 'src/exceptions';
import { FileInputType } from 'src/resolvers/file.resolver';
import { DataSource, In, Repository } from 'typeorm';

import { BrandService } from './brand.service';
import { FileService } from './file.service';
import { GeocodingService } from './geocoding.service';

const GEMINI_TIMEOUT_MS = 120_000;
const IMPORT_FILE_FETCH_TIMEOUT_MS = 20_000;

interface CmsAdImportDeliveryDefaults {
  address?: string;
  pickupEnabled?: boolean;
  deliveryEnabled?: boolean;
  deliveryRadius?: number;
  deliveryPrice?: number;
  shippingPriceId?: string;
}

interface CreateCmsAdImportBatchInput {
  sellerId: string;
  files: FileInputType[];
  deliveryDefaults?: CmsAdImportDeliveryDefaults;
}

interface ImportDraft {
  title?: string;
  description?: string;
  brand?: string;
  categoryId?: string;
  condition?: ProductConditionEnum;
  primaryQuantification?: string;
  secondaryQuantification?: string;
  dimensions?: Record<string, string>;
  weight?: number;
  color?: string;
  price?: number;
  isGiveaway?: boolean;
  sourceImageFileNames?: string[];
}

@Injectable()
export class CmsAdImportService {
  private readonly gemini = new GoogleGenAI({});

  constructor(
    @InjectRepository(CmsAdImportBatch)
    private readonly batchRepository: Repository<CmsAdImportBatch>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ShippingPrice)
    private readonly shippingPriceRepository: Repository<ShippingPrice>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly brandService: BrandService,
    private readonly fileService: FileService,
    private readonly geocodingService: GeocodingService,
    private readonly dataSource: DataSource,
  ) {}

  async createBatch(
    createdByUserId: string,
    input: CreateCmsAdImportBatchInput,
  ) {
    const { sellerId, files, deliveryDefaults } = input;
    const seller = await this.userRepository.findOneBy({ id: sellerId });
    if (!seller) throw BadUserInputException('Seller not found');
    if (!files.length)
      throw BadUserInputException('At least one file is required');

    const address = deliveryDefaults?.address?.trim() || null;
    if (
      (deliveryDefaults?.pickupEnabled ||
        deliveryDefaults?.deliveryEnabled ||
        deliveryDefaults?.shippingPriceId) &&
      !address
    ) {
      throw BadUserInputException(
        'Address is required when using shared delivery defaults',
      );
    }
    if (
      deliveryDefaults?.deliveryEnabled &&
      (deliveryDefaults.deliveryRadius === undefined ||
        deliveryDefaults.deliveryRadius < 0 ||
        deliveryDefaults.deliveryPrice === undefined ||
        deliveryDefaults.deliveryPrice < 0)
    ) {
      throw BadUserInputException(
        'Radius and price are required for home delivery',
      );
    }
    if (
      deliveryDefaults?.shippingPriceId &&
      !(await this.shippingPriceRepository.existsBy({
        id: deliveryDefaults.shippingPriceId,
      }))
    ) {
      throw BadUserInputException('Shipping price not found');
    }

    const dbFiles = await this.fileService.createFiles(files, true);
    const batch = await this.batchRepository.save(
      this.batchRepository.create({
        createdByUserId,
        sellerId,
        files: dbFiles,
        defaultAddress: address,
        defaultPickupEnabled: deliveryDefaults?.pickupEnabled ?? false,
        defaultDeliveryEnabled: deliveryDefaults?.deliveryEnabled ?? false,
        defaultDeliveryRadius: deliveryDefaults?.deliveryEnabled
          ? deliveryDefaults.deliveryRadius * 1000
          : null,
        defaultDeliveryPrice: deliveryDefaults?.deliveryEnabled
          ? deliveryDefaults.deliveryPrice * 100
          : null,
        defaultShippingPriceId: deliveryDefaults?.shippingPriceId ?? null,
        status: CmsAdImportBatchStatus.UPLOADING,
      }),
    );
    return { batch, uploadUrls: await this.fileService.uploadFiles(dbFiles) };
  }

  async startBatch(batchId: string) {
    const batch = await this.findBatch(batchId);
    if (batch.status !== CmsAdImportBatchStatus.UPLOADING) {
      throw BadUserInputException('Import batch has already started');
    }
    batch.status = CmsAdImportBatchStatus.QUEUED;
    batch.progress = 5;
    const saved = await this.batchRepository.save(batch);
    void this.processBatch(saved.id);
    return saved;
  }

  async getBatch(batchId: string) {
    const batch = await this.findBatch(batchId);
    const changed = batch.products.filter((product) => {
      const issues = this.validate(product);
      if (issues.join('|') === product.cmsImportValidationIssues.join('|'))
        return false;
      product.cmsImportValidationIssues = issues;
      return true;
    });
    if (changed.length) await this.productRepository.save(changed);
    return batch;
  }

  async removeBatch(batchId: string) {
    const batch = await this.findBatch(batchId);
    await this.dataSource.transaction(async (manager) => {
      const products = await manager.find(Product, {
        where: { cmsAdImportBatchId: batch.id },
        relations: { images: true, documents: true },
      });
      const drafts = products.filter(
        (product) => product.status === ProductStatus.DRAFT,
      );
      const batchFiles = await this.fileRepository.find({
        where: { id: In(batch.files.map((file) => file.id)) },
        relations: { productImage: true, productDocument: true },
      });
      const retainedFileIds = new Set(
        batchFiles
          .filter(
            (file) =>
              file.productImage?.status === ProductStatus.PUBLISHED ||
              file.productDocument?.status === ProductStatus.PUBLISHED,
          )
          .map((file) => file.id),
      );
      const files = [
        ...batchFiles.filter((file) => !retainedFileIds.has(file.id)),
        ...drafts.flatMap((product) => [
          ...(product.images ?? []),
          ...(product.documents ?? []),
        ]),
      ].filter(
        (file, index, all) =>
          all.findIndex((item) => item.id === file.id) === index,
      );
      await this.fileService.deleteFiles(files);
      if (drafts.length) await manager.remove(drafts);
      await manager.remove(batch);
    });
    return true;
  }

  async removeDraft(batchId: string, productId: string) {
    const batch = await this.findBatch(batchId);
    const product = await this.productRepository.findOne({
      where: {
        id: productId,
        cmsAdImportBatchId: batch.id,
        status: ProductStatus.DRAFT,
      },
      relations: { images: true, documents: true },
    });
    if (!product) throw NotFoundException('Imported product draft not found');
    await this.fileService.deleteFiles([
      ...(product.images ?? []),
      ...(product.documents ?? []),
    ]);
    await this.productRepository.remove(product);
    return true;
  }

  async publish(batchId: string, productIds: string[]) {
    const batch = await this.findBatch(batchId);
    const products = await this.productRepository.find({
      where: { id: In(productIds), cmsAdImportBatchId: batch.id },
      relations: { shippingPrices: true },
    });
    if (products.length !== productIds.length)
      throw BadUserInputException('Invalid imported products');
    const invalid = products.filter((product) => this.validate(product).length);
    if (invalid.length)
      throw BadUserInputException('All published ads must be valid');
    products.forEach((product) => {
      product.status = ProductStatus.PUBLISHED;
      product.cmsAdImportBatchId = null;
      product.cmsImportValidationIssues = [];
    });
    const saved = await this.productRepository.save(products);
    const remaining = await this.productRepository.count({
      where: { cmsAdImportBatchId: batch.id },
    });
    if (!remaining)
      await this.batchRepository.update(batch.id, {
        status: CmsAdImportBatchStatus.PUBLISHED,
        progress: 100,
      });
    return saved;
  }

  private async processBatch(batchId: string) {
    const batch = await this.batchRepository.findOne({
      where: { id: batchId },
      relations: { files: true },
    });
    if (!batch) return;
    try {
      await this.batchRepository.update(batch.id, {
        status: CmsAdImportBatchStatus.PROCESSING,
        progress: 15,
      });
      const categories = (
        await this.categoryRepository.find({
          relations: { parent: true },
        })
      ).filter((category) => !!category.parentId);
      const categoryList = categories
        .map(
          (category) =>
            `${category.id} | ${category.parent?.name ?? ''} > ${category.name}`,
        )
        .join('\n');
      const parts = await this.fileParts(batch.files);
      await this.batchRepository.update(batch.id, { progress: 45 });
      const response = await this.gemini.models.generateContent({
        model: 'gemini-3-flash-preview',
        config: {
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          httpOptions: { timeout: GEMINI_TIMEOUT_MS },
        },
        contents: [{ parts: [...parts, { text: this.prompt(categoryList) }] }],
      });
      const active = await this.batchRepository.findOneBy({ id: batch.id });
      if (!active || active.status === CmsAdImportBatchStatus.FAILED) return;
      await this.batchRepository.update(batch.id, { progress: 70 });
      await this.createDrafts(
        batch,
        this.parse(response.text ?? ''),
        categories,
      );
      await this.batchRepository.update(batch.id, {
        status: CmsAdImportBatchStatus.READY,
        progress: 100,
      });
    } catch (error) {
      await this.batchRepository.update(batchId, {
        status: CmsAdImportBatchStatus.FAILED,
        progress: 100,
        errorMessage: error instanceof Error ? error.message : 'Import failed',
      });
    }
  }

  private async createDrafts(
    batch: CmsAdImportBatch,
    drafts: ImportDraft[],
    categories: Category[],
  ) {
    const images = new Map(
      batch.files
        .filter((file) => file.mimeType.startsWith('image/'))
        .map((file) => [file.name?.toLowerCase(), file]),
    );
    const usedImages = new Set<string>();
    const defaultLocation = batch.defaultAddress
      ? await this.geocodingService.addressToLocation(batch.defaultAddress)
      : null;
    const defaultShippingPrice = batch.defaultShippingPriceId
      ? await this.shippingPriceRepository.findOneBy({
          id: batch.defaultShippingPriceId,
        })
      : null;
    for (const draft of drafts) {
      const parsedPrice = Number(draft.price);
      const suggestedPrice =
        Number.isFinite(parsedPrice) && parsedPrice > 0
          ? Math.round(parsedPrice)
          : 100;
      const product = this.productRepository.create({
        sellerId: batch.sellerId,
        visibility: ProductVisibility.PUBLIC,
        status: ProductStatus.DRAFT,
        cmsAdImportBatchId: batch.id,
        title: draft.title?.trim() || 'Material från import',
        description:
          draft.description?.trim() ||
          'Beskrivning saknas i underlaget. Kontrollera och komplettera.',
        price: draft.isGiveaway ? 0 : suggestedPrice * 100,
        isGiveaway: draft.isGiveaway === true,
        condition: Object.values(ProductConditionEnum).includes(draft.condition)
          ? draft.condition
          : ProductConditionEnum.GOOD,
        color: draft.color?.trim() ?? null,
        colorType: draft.color ? ColorTypeEnum.FREE_TEXT : ColorTypeEnum.NCS,
        address: batch.defaultAddress ?? null,
        addressLocation: defaultLocation
          ? {
              type: 'Point',
              coordinates: [defaultLocation.lat, defaultLocation.lng],
            }
          : null,
        noProject: true,
        pickupEnabled: batch.defaultPickupEnabled,
        deliveryEnabled: batch.defaultDeliveryEnabled,
        deliveryRadius: batch.defaultDeliveryRadius,
        deliveryPrice: batch.defaultDeliveryPrice,
        shippingPrices: defaultShippingPrice ? [defaultShippingPrice] : [],
        soldByQuantity: false,
      });
      if (
        draft.categoryId &&
        categories.some((category) => category.id === draft.categoryId)
      )
        product.categoryId = draft.categoryId;
      this.quantify(product, draft.primaryQuantification, 'primary');
      this.quantify(product, draft.secondaryQuantification, 'secondary');
      if (!product.primaryQuantity || !product.primaryUnit) {
        product.primaryQuantity = 1;
        product.primaryUnit = QuantityUnitEnum.AMOUNT;
      }
      this.dimensions(product, draft.dimensions);
      if (draft.weight) {
        product.weight = Math.round(draft.weight);
        product.weightUnit = MeasurementUnitEnum.KG;
      }
      const brandName = draft.brand?.trim() || 'Okänt';
      const brand =
        (await this.brandService.findBrandByName(brandName)) ??
        (await this.brandService.createBrand({
          name: brandName,
          categoryId: product.categoryId,
        }));
      product.brand = brand;
      product.brandId = brand.id;
      const saved = await this.productRepository.save(product);
      const matched = (draft.sourceImageFileNames ?? [])
        .map((name) => images.get(name.toLowerCase()))
        .filter((file): file is File => !!file && !usedImages.has(file.id));
      matched.forEach((file) => {
        file.productImage = saved;
        usedImages.add(file.id);
      });
      if (matched.length) await this.fileRepository.save(matched);
      saved.cmsImportValidationIssues = this.validate(saved);
      await this.productRepository.save(saved);
    }
  }

  private validate(product: Product) {
    const issues: string[] = [];
    if (!product.title?.trim()) issues.push('Titel saknas');
    if (!product.description?.trim()) issues.push('Beskrivning saknas');
    if (!product.categoryId) issues.push('Kategori saknas');
    if (!product.primaryQuantity || !product.primaryUnit)
      issues.push('Mängd saknas');
    if (!product.condition) issues.push('Skick saknas');
    if (!product.brandId) issues.push('Varumärke saknas');
    if (!product.sellerId) issues.push('Säljare saknas');
    if (!product.address && !product.projectId) issues.push('Plats saknas');
    if (!product.isGiveaway && product.price <= 0) issues.push('Pris saknas');
    if (
      !product.pickupEnabled &&
      !product.deliveryEnabled &&
      !product.shippingPrices?.length
    )
      issues.push('Leveranssätt saknas');
    return issues;
  }

  private async fileParts(files: File[]): Promise<Part[]> {
    const parts: Part[] = [];
    for (const file of files) {
      const response = await fetch(await this.fileService.getUrl(file), {
        signal: AbortSignal.timeout(IMPORT_FILE_FETCH_TIMEOUT_MS),
      });
      if (!response.ok)
        throw new Error(`Could not fetch uploaded file ${file.id}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      const isXlsx =
        file.mimeType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      parts.push({
        text: `FILE_NAME: ${file.name ?? file.id}\nMIME_TYPE: ${isXlsx ? 'text/plain (converted from XLSX)' : file.mimeType}`,
      });
      if (isXlsx) {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        parts.push({
          text: workbook.SheetNames.map(
            (name) =>
              `SHEET: ${name}\n${XLSX.utils.sheet_to_csv(workbook.Sheets[name])}`,
          ).join('\n\n'),
        });
      } else
        parts.push({
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: file.mimeType,
          },
        });
    }
    return parts;
  }

  private prompt(categoryList: string) {
    return `You create draft listings for RebuildR, a Swedish marketplace for reclaimed building materials. The uploaded files may be PDFs, XLSX, CSV and images. Use all context and match images to products. Return ONLY JSON: {"products":[{"title":"Swedish title, max 8 words","description":"Swedish factual description, max 60 words","brand":"exact normalized brand/manufacturer name, or Okänt when it cannot be identified","condition":"${Object.values(ProductConditionEnum).join('|')}","primaryQuantification":"QUANTITY,${Object.keys(QuantityUnitEnum).join('|')}","secondaryQuantification":"QUANTITY,UNIT or null","dimensions":{"height":"100,MM"},"weight":10,"color":"color or null","price":100,"isGiveaway":false,"categoryId":"category UUID or null","sourceImageFileNames":["exact-image.jpg"]}]}. Price is the total asking price in SEK for the listed quantity. Use an explicit source price when available; otherwise ALWAYS estimate a realistic conservative asking price for reclaimed material based on the available product information. Set isGiveaway to true only when the source explicitly says the product is free. Brand is required: normalize the manufacturer name deterministically from explicit source text or a visible logo; if it cannot be identified, ALWAYS return exactly Okänt. Do not invent exact measurements or brands. Use null for unknown optional data. Always propose title, description, brand, category, quantity, condition and price for review. CATEGORY LIST:\n${categoryList}`;
  }

  private parse(text: string) {
    const parsed = JSON.parse(
      text
        .replace(/^```json/i, '')
        .replace(/```$/i, '')
        .trim(),
    ) as { products?: ImportDraft[] } | ImportDraft[];
    const products = Array.isArray(parsed) ? parsed : parsed.products;
    if (!products?.length) throw new Error('AI returned no products');
    return products;
  }

  private quantify(
    product: Product,
    value: string | undefined,
    kind: 'primary' | 'secondary',
  ) {
    if (!value?.includes(',')) return;
    const [amount, unit] = value.split(',');
    if (!(unit.trim() in QuantityUnitEnum) || !Number.isFinite(Number(amount)))
      return;
    if (kind === 'primary') {
      product.primaryQuantity = Math.round(Number(amount));
      product.primaryUnit = unit.trim() as QuantityUnitEnum;
    } else {
      product.secondaryQuantity = Math.round(Number(amount));
      product.secondaryUnit = unit.trim() as QuantityUnitEnum;
    }
  }

  private dimensions(product: Product, values?: Record<string, string>) {
    for (const key of ['height', 'width', 'length', 'thickness', 'diameter']) {
      const value = values?.[key];
      if (!value?.includes(',')) continue;
      const [amount, unit] = value.split(',');
      if (!Number.isFinite(Number(amount))) continue;
      product[key] = Math.round(Number(amount));
      product[`${key}Unit`] = unit.trim() as MeasurementUnitEnum;
    }
  }

  private async findBatch(id: string) {
    const batch = await this.batchRepository.findOne({
      where: { id },
      relations: {
        files: true,
        products: {
          images: true,
          category: true,
          brand: true,
          shippingPrices: true,
        },
      },
      order: { products: { createdAt: 'ASC' } },
    });
    if (!batch) throw NotFoundException('Import batch not found');
    return batch;
  }
}
