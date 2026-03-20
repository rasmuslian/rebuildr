import { GoogleGenAI, Part, PartMediaResolutionLevel } from '@google/genai';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ColorTypeEnum,
  MeasurementUnitEnum,
  Product,
  ProductConditionEnum,
} from 'src/entities/product.entity';
import { BadUserInputException, InternalServerException } from 'src/exceptions';
import { AnalyzeProductImageInput } from 'src/resolvers/product.resolver';
import { Repository } from 'typeorm';
import { FileService } from './file.service';
import { QuantityUnitEnum } from 'src/constants/enums';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { BrandService } from './brand.service';

@Injectable()
export class AIService {
  private gemini: GoogleGenAI;

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private fileService: FileService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private brandService: BrandService,
  ) {
    this.gemini = new GoogleGenAI({});
  }

  async analyzeProductImage(input: AnalyzeProductImageInput): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: input.productId },
      relations: { images: true },
    });
    if (!product) {
      throw BadUserInputException();
    }
    const images = product.images;
    if (!images) {
      throw BadUserInputException();
    }

    const quantities = Object.keys(QuantityUnitEnum);

    const imageParts: Part[] = await Promise.all(
      product.images.map(async (image) => {
        const imageUrl = await this.fileService.getUrl(image);
        const imageResponse = await fetch(imageUrl);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const imageBase64 = Buffer.from(arrayBuffer).toString('base64');
        return {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg',
          },
          mediaResolution: {
            level: PartMediaResolutionLevel.MEDIA_RESOLUTION_HIGH,
          },
        };
      }),
    );

    const response = await this.gemini.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: {
        responseMimeType: 'application/json',
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
              "primaryQuantification": "Primary quantification. Determine which of the following quantity units (${quantities}) best applies to the product/products on the image and what quantity of that unit are visible. Format the value as QUANTITY,QUANTITY ENUM.
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
              null. Format: NUMBER,UNIT",
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
              }
              `,
            },
          ],
        },
      ],
    });

    const result = response.text;
    try {
      const parsed = JSON.parse(result);
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
      } = parsed;
      product.title = title;
      product.description = description;
      product.additionalInfo = additionalInfo;
      if (primaryQuantification) {
        const [primaryQuantity, primaryUnit] = primaryQuantification.split(',');
        if (!(primaryUnit in QuantityUnitEnum)) {
          throw new Error('Enum not found');
        }
        product.primaryQuantity = primaryQuantity;
        product.primaryUnit = primaryUnit.trim();
      }
      if (secondaryQuantification) {
        const [secondaryQuantity, secondaryUnit] =
          secondaryQuantification.split(',');
        product.secondaryQuantity = secondaryQuantity;
        product.secondaryUnit = secondaryUnit.trim();
      }

      const separateValueAndUnit = (dimension: string) => {
        return dimension.split(',');
      };

      //Set measurements
      if (dimensions) {
        Object.keys(dimensions).map((key) => {
          if (!(key in product)) {
            return;
          }

          const [value, unit] = separateValueAndUnit(dimensions[key]);
          product[key] = parseInt(value);
          product[key + 'Unit'] = unit.trim();
        });
      }

      product.weight = weight;
      product.weightUnit = MeasurementUnitEnum.KG;

      product.color = color;
      product.colorType = ColorTypeEnum.FREE_TEXT;
      product.condition = condition;

      //Brand
      try {
        if (brand) {
          const dbBrand = await this.brandService.findBrandByName(brand);
          if (dbBrand) {
            product.brand = dbBrand;
          } else {
            product.brand = await this.brandService.createBrand({
              name: brand,
              categoryId: product.categoryId,
            });
          }
        }
      } catch (e) {
        throw new Error('Could not attach brand to product: ' + e);
      }

      return await this.productRepository.save(product);
    } catch (e) {
      this.logger.error('analyzeProductImage failed', {
        e,
        input,
        productId: product.id,
      });
      throw InternalServerException('Error parsing the image');
    }
  }
}
