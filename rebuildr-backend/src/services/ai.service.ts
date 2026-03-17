import { GoogleGenAI, PartMediaResolutionLevel } from '@google/genai';
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

@Injectable()
export class AIService {
  private gemini: GoogleGenAI;

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private fileService: FileService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
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
    const image = product.images[input.imageIndex];
    if (!image) {
      throw BadUserInputException();
    }

    const imageUrl = await this.fileService.getUrl(image);
    const conditions = Object.keys(ProductConditionEnum);
    const quantities = Object.keys(QuantityUnitEnum);

    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(arrayBuffer).toString('base64');

    const response = await this.gemini.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: {
        responseMimeType: 'application/json',
      },
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: 'image/jpeg',
              },
              mediaResolution: {
                level: PartMediaResolutionLevel.MEDIA_RESOLUTION_HIGH,
              },
            },
            {
              text: `Your are a seller. Analyse this product image and return the analysis in Swedish as a JSON with the following fields:
              {
              title: A title fitting the the product in the image,
              description: A description of at most 500 word, describing the product in the image,
              quantity: Determine which of the following quantity units (${quantities}) best applies to the product/products on the image and what quantity of that unit are visible. Format the value as QUANTITY,QUANTITY ENUM, 
              height: Estimate the height of the product expressed as an integer representing a mm value,
              width: Estimate the width of the product expressed as an integer representing a mm value,
              length: Estimate the length of the product expressed as an integer representing a mm value,
              thickness: Estimate the thickness of the product expressed as an integer representing a mm value,
              diameter: Estimate the diameter of the product expressed as an integer representing a mm value,
              weight: Estimate the weight of the product expressed as an integer representing a kg value,
              color: What would be the single most prominent color of the product in the image,
              condition: Given the values ${conditions} which value applies to the product
              } `,
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
        quantity,
        height,
        width,
        length,
        thickness,
        diameter,
        weight,
        color,
        condition,
      } = parsed;
      product.title = title;
      product.description = description;
      const [primaryQuantity, primaryUnit] = quantity.split(',');
      product.primaryQuantity = primaryQuantity;
      product.primaryUnit = primaryUnit.trim();

      //Set measurements and reset units to default values
      product.height = height;
      product.heightUnit = MeasurementUnitEnum.MM;
      product.width = width;
      product.widthUnit = MeasurementUnitEnum.MM;
      product.length = length;
      product.lengthUnit = MeasurementUnitEnum.MM;
      product.thickness = thickness;
      product.thicknessUnit = MeasurementUnitEnum.MM;
      product.diameter = diameter;
      product.diameterUnit = MeasurementUnitEnum.MM;
      product.weight = weight;
      product.weightUnit = MeasurementUnitEnum.KG;

      product.color = color;
      product.colorType = ColorTypeEnum.FREE_TEXT;
      product.condition = condition;

      return product;
    } catch (e) {
      this.logger.error('analyzeProductImage failed', {
        e,
        input,
      });
      throw InternalServerException('Error parsing the image');
    }
  }
}
